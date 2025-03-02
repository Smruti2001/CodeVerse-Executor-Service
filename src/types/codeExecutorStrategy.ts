export default interface CodeExecutorStrategy {
    execute(code: string, inputTestCase: string, outputTestCases: string): Promise<ExecutionResponse>;
}

export type ExecutionResponse = { output: string, status: string }