import { test, expect } from '@playwright/test';

test.describe('Value Capture Integration Tests (Batch)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#terminal-output')).toContainText('Ruby WASM ready!', { timeout: 90000 });
        await page.waitForSelector('.monaco-editor');
        await page.evaluate(async () => {
            for (let i = 0; i < 60; i++) {
                if (window.ruboxLSPReady) return true;
                await new Promise(r => setTimeout(r, 500));
            }
        });
    });

    const executionCases = [
        // --- 1. Scoping (U8, U9, U10, S9) ---
        {
            name: 'Scope: Top-level vs Method (U8)',
            code: 'target = "banana"\ndef my_count\n  target = "apple"\n  target\nend\nmy_count',
            line: 3, expr: 'target', expected: '"apple"'
        },
        {
            name: 'Scope: Method param isolation (U9)',
            code: 'target = "banana"\ndef my_count(target)\n  target\nend\nmy_count("apple")',
            line: 0, expr: 'target', expected: '"banana"'
        },
        {
            name: 'Scope: Local var in method (U10)',
            code: 'def my_method\n  x = 10\n  x\nend\nmy_method',
            line: 2, expr: 'x', expected: '10'
        },
        {
            name: 'Scope: Class method capture (S9)',
            code: 'class P; def self.f(t); t.strip; end; end; P.f(" ruby ")',
            line: 0, col: 18, expr: 't', expected: '" ruby "'
        },

        // --- 2. Loops and Transformation (U3, U11, U12, S6, S7, R1, R2) ---
        {
            name: 'Loop: Simple increment (U3)',
            code: 'a = 0\n3.times do |i|\n  a += 1\nend',
            line: 2, expr: 'a', expected: '1, 2, 3'
        },
        {
            name: 'Loop: Block mutation (U11)',
            code: 'a = []\n3.times do |i|\n  a << [1].map { |n| n }\nend',
            line: 2, expr: 'a', expected: '[[1]], [[1], [1]], [[1], [1], [1]]'
        },
        {
            name: 'Loop: Single line (U12/R1)',
            code: 'a = []; 3.times { a << [1] }',
            line: 0, expr: 'a << [1]', expected: '[[1]], [[1], [1]], [[1], [1], [1]]'
        },
        {
            name: 'Loop: Collection each (S6)',
            code: 'items = ["a", "b"]\nitems.each do |item|\n  item\nend',
            line: 2, expr: 'item', expected: '"a", "b"'
        },
        {
            name: 'Loop: Mutable trace (S7)',
            code: 'a = "R"\n3.times do\n  a << "!"\nend',
            line: 2, expr: 'a', expected: '"R!", "R!!", "R!!!"'
        },
        {
            name: 'Regression: Multi-line nested (R2)',
            code: 'a = []\n3.times do |i|\n  a << [i]\nend',
            line: 2, expr: 'a << [i]', expected: '[[0]], [[0], [1]], [[0], [1], [2]]'
        },

        // --- 3. Timing and Filtering (U1, U4, U5, U6, S10) ---
        {
            name: 'Timing: Prevent future capture (U1/S10)',
            code: 's = "R"\n5.times { s << "!" }\ns = "reset"',
            line: 0, expr: 's', expected: '"R"'
        },
        {
            name: 'Timing: Re-assignment shows new only (U4)',
            code: 's = "R"\n5.times { s << "!" }\nputs s\ns = "nil"\nputs s',
            line: 4, expr: 's', expected: '"nil"'
        },
        {
            name: 'Timing: Current value at puts (U5)',
            code: 's = "R"\n3.times { s << "!" }\nputs s\ns = "reset"',
            line: 2, expr: 's', expected: '"R!!!"'
        },
        {
            name: 'Filtering: No intermediate nil (U6)',
            code: 'targets = ["a", "bb"]\nmax = targets.max_by{|t| t.size}.size',
            line: 1, expr: 'max', expected: '2'
        },

        // --- 4. Misc (U7, S5) ---
        {
            name: 'Misc: Method chain (U7)',
            code: 't = "abc"\nt.each_char',
            line: 1, expr: 't.each_char', expected: '/#<Enumerator: "abc":each_char>/'
        },
        {
            name: 'Misc: Long array no ellipsis (S5)',
            code: 'x = (1..20).to_a',
            line: 0, expr: 'x', expected: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]'
        }
    ];

    test('Core Execution Logic: Batch Validation', async ({ page }) => {
        for (const c of executionCases) {
            await test.step(`Case: ${c.name}`, async () => {
                await setCodeAndSync(page, c.code);
                const result = await measureValue(page, c.line, c.col || 0, c.expr);
                
                if (c.expected instanceof RegExp || (typeof c.expected === 'string' && c.expected.startsWith('/'))) {
                    const pattern = c.expected instanceof RegExp ? c.expected : new RegExp(c.expected.slice(1, -1));
                    expect(result).toMatch(pattern);
                } else {
                    expect(result).toBe(c.expected);
                }
            });
        }
    });

    test('IO Logic: gets and split (U2, R3)', async ({ page }) => {
        // U2: gets
        await setCodeAndSync(page, 'x = gets');
        const res1 = await measureValue(page, 0, 0, 'x', 'hello\n');
        expect(res1).toBe('"hello\\n"');

        // R3: gets split multi-assign
        await setCodeAndSync(page, 'x, y = gets.split.map(&:to_i)');
        const res2 = await measureValue(page, 0, 0, 'x, y = gets.split.map(&:to_i)', '10 20\n');
        // sanitize により [x, y] が評価される
        expect(res2).toBe('[10, 20]');
    });
});

// --- Helpers ---

async function setCodeAndSync(page, code) {
    await page.evaluate((c) => {
        window.monacoEditor.setValue(c);
        window.ruboxLSPManager.flushDocumentSync();
    }, code);
    await page.waitForTimeout(500); 
}

async function measureValue(page, line, character, expression, stdin = "") {
    return await page.evaluate(async ({ line, character, expression, stdin }) => {
        const params = {
            command: "typeprof.measureValue",
            arguments: [{
                uri: window.monacoEditor.getModel().uri.toString(),
                line, character, expression, stdin
            }]
        };
        return await window.ruboxLSPManager.client.sendRequest("workspace/executeCommand", params);
    }, { line, character, expression, stdin });
}
