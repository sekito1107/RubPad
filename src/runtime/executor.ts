/**
 * Ruby VM (Worker) へのコード送信と実行結果の購読を担当する
 */
export interface RubyVMController {
  run(code: string): void;
}

export class Executor {
  private controller: RubyVMController;

  constructor(controller: RubyVMController) {
    this.controller = controller;
  }

  /**
   * コードを実行する
   * @param {string} code 
   */
  execute(code: string): void {
    if (!code) return;
    this.controller.run(code);
  }
}
