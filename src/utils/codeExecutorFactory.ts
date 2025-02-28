import CppExecutor from "../containers/runCppContainer";
import JavaExecutor from "../containers/runJavaContainer";
import PythonExecutor from "../containers/runPythonContainer";
import CodeExecutorStrategy from "../types/codeExecutorStrategy";

export default function createCodeExecutor(language: string): CodeExecutorStrategy | null {
    if(language.toLowerCase() == 'java') {
        return new JavaExecutor();
    } else if(language.toLowerCase() == 'cpp') {
        return new CppExecutor();
    } else if(language.toLowerCase() == 'python') {
        return new PythonExecutor();
    } else {
        return null;
    }
}