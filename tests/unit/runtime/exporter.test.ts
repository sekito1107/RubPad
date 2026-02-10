import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Exporter } from '../../../src/runtime/exporter';

describe('Exporter', () => {
  let mockEditor: any;
  let exporter: Exporter;

  beforeEach(() => {
    mockEditor = {
      getValue: vi.fn().mockReturnValue('ruby code')
    };
    exporter = new Exporter(mockEditor);
    
    // グローバルオブジェクトのモック
    vi.stubGlobal('Blob', vi.fn());
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:url'),
      revokeObjectURL: vi.fn()
    });
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: vi.fn()
      })
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('export', () => {
    it('Blobを作成し、ダウンロードをトリガーすること', () => {
      exporter.export('test.rb');
      
      expect(mockEditor.getValue).toHaveBeenCalled();
      expect(global.Blob).toHaveBeenCalledWith(['ruby code'], { type: 'text/plain' });
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      
      const mockElement = (document.createElement as any).mock.results[0].value;
      expect(mockElement.download).toBe('test.rb');
      expect(mockElement.href).toBe('blob:url');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('ファイル名が指定されない場合はデフォルトを使用すること', () => {
      exporter.export();
      const mockElement = (document.createElement as any).mock.results[0].value;
      expect(mockElement.download).toBe('main.rb');
    });

    it('1秒後にオブジェクトURLを取り消すこと', () => {
      exporter.export();
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(1000);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });
});
