export type Language = 'javascript' | 'python' | 'cpp' | 'c' | 'java' | 'html';

export interface LanguageConfig {
  label: string;
  judge0Id?: number;
  fileName: string;
  runLocal: boolean;
  showInput: boolean;
  showPreview: boolean;
  color: string;
}

export const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
  javascript: {
    label: "JavaScript",
    judge0Id: 63,
    fileName: "main.js",
    runLocal: true,
    showInput: true,
    showPreview: false,
    color: "#f7df1e",
  },
  python: {
    label: "Python",
    judge0Id: 71,
    fileName: "main.py",
    runLocal: false,
    showInput: true,
    showPreview: false,
    color: "#3776ab",
  },
  java: {
    label: "Java",
    judge0Id: 62,
    fileName: "Main.java",
    runLocal: false,
    showInput: true,
    showPreview: false,
    color: "#ed8b00",
  },
  cpp: {
    label: "C++",
    judge0Id: 54,
    fileName: "main.cpp",
    runLocal: false,
    showInput: true,
    showPreview: false,
    color: "#00599c",
  },
  c: {
    label: "C",
    judge0Id: 50,
    fileName: "main.c",
    runLocal: false,
    showInput: true,
    showPreview: false,
    color: "#a8b9cc",
  },
  html: {
    label: "HTML / CSS",
    fileName: "index.html",
    runLocal: true,
    showInput: false,
    showPreview: true,
    color: "#e34c26",
  },
};

export const STARTER_CODE: Record<Language, string> = {
  javascript: `// Use readline() for input, console.log() for output
const name = readline() || "CodeOn";
console.log("Hello, " + name + "!");`,
  python: `# Use input() for stdin
name = input() or "CodeOn"
print(f"Hello, {name}!")`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeOn!");
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeOn!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, CodeOn!\\n");
    return 0;
}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CodeOn Preview</title>
    <style>
        body {
            font-family: system-ui, sans-serif;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            color: white;
            margin: 0;
        }
        .container { text-align: center; padding: 40px; }
        h1 { font-size: 3rem; margin-bottom: 16px; }
        button {
            background: white;
            color: #2563eb;
            border: none;
            padding: 12px 32px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Hello, CodeOn!</h1>
        <p>Edit the code to see live changes!</p>
        <button onclick="alert('Welcome!')">Click Me</button>
    </div>
</body>
</html>`,
};