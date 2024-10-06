const readline = require('readline');

// SparseMatrix Class
class SparseMatrix {
    constructor(numRows, numCols) {
        this.rows = numRows;
        this.cols = numCols;
        this.elements = {}; // Use an object to store non-zero elements
    }

    static fromFile(matrixFileContent) {
        const lines = matrixFileContent.trim().split('\n');

        if (lines.length < 2) {
            throw new Error("Invalid matrix file: not enough lines for matrix dimensions.");
        }

        // Parse matrix dimensions
        const rowMatch = lines[0].match(/rows=(\d+)/);
        const colMatch = lines[1].match(/cols=(\d+)/);

        if (!rowMatch || !colMatch) {
            throw new Error("Invalid matrix file: could not parse dimensions.");
        }

        const totalRows = parseInt(rowMatch[1], 10);
        const totalCols = parseInt(colMatch[1], 10);
        const sparseMatrix = new SparseMatrix(totalRows, totalCols);

        // Parse matrix elements
        for (let i = 2; i < lines.length; i++) {
            const match = lines[i].match(/\((\d+),\s*(\d+),\s*(-?\d+)\)/);
            if (!match) continue;

            const row = parseInt(match[1], 10);
            const col = parseInt(match[2], 10);
            const value = parseInt(match[3], 10);

            sparseMatrix.setElement(row, col, value);
        }

        return sparseMatrix;
    }

    getElement(row, col) {
        return this.elements[`${row},${col}`] || 0;
    }

    setElement(row, col, value) {
        this.elements[`${row},${col}`] = value;
    }

    add(other) {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error("Matrices must have the same dimensions for addition.");
        }

        const result = new SparseMatrix(this.rows, this.cols);

        for (const key in this.elements) {
            result.elements[key] = this.elements[key];
        }

        for (const key in other.elements) {
            result.elements[key] = (result.elements[key] || 0) + other.elements[key];
        }

        return result;
    }

    subtract(other) {
        if (this.rows !== other.rows || this.cols !== other.cols) {
            throw new Error("Matrices must have the same dimensions for subtraction.");
        }

        const result = new SparseMatrix(this.rows, this.cols);

        for (const key in this.elements) {
            result.elements[key] = this.elements[key];
        }

        for (const key in other.elements) {
            result.elements[key] = (result.elements[key] || 0) - other.elements[key];
        }

        return result;
    }

    multiply(other) {
        if (this.cols !== other.rows) {
            throw new Error("Number of columns of the first matrix must equal number of rows of the second matrix.");
        }

        const result = new SparseMatrix(this.rows, other.cols);

        for (const [key, value] of Object.entries(this.elements)) {
            const [row, col] = key.split(',').map(Number);

            for (let k = 0; k < other.cols; k++) {
                const otherValue = other.getElement(col, k);
                if (otherValue !== 0) {
                    result.setElement(row, k, result.getElement(row, k) + value * otherValue);
                }
            }
        }

        return result;
    }

    toString() {
        let result = `rows=${this.rows}\ncols=${this.cols}\n`;
        for (const key in this.elements) {
            const [row, col] = key.split(',').map(Number);
            result += `(${row}, ${col}, ${this.elements[key]})\n`;
        }
        return result;
    }

    saveToFile() {
        return this.toString();
    }
}

// Readline Interface for User Input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function performCalculations() {
    const matrixOperations = {
        '1': { name: "addition", method: "add" },
        '2': { name: "subtraction", method: "subtract" },
        '3': { name: "multiplication", method: "multiply" }
    };

    console.log("Available operations:");
    for (const key in matrixOperations) {
        console.log(`${key}: ${matrixOperations[key].name}`);
    }

    // Get matrix data input from user (simulating file input)
    const matrixFileContent1 = await askQuestion("Enter the first matrix data (file content):\n");
    const matrixFileContent2 = await askQuestion("Enter the second matrix data (file content):\n");

    const matrix1 = SparseMatrix.fromFile(matrixFileContent1);
    const matrix2 = SparseMatrix.fromFile(matrixFileContent2);

    const operationChoice = await askQuestion("Choose an operation (1, 2, or 3): ");
    const operation = matrixOperations[operationChoice];

    if (!operation) {
        throw new Error("Invalid operation choice.");
    }

    const resultMatrix = matrix1[operation.method](matrix2);
    console.log(`Output of ${operation.name}:\n`);
    console.log(resultMatrix.toString());

    // Simulate saving the result (or just display it)
    const outputFilePath = await askQuestion("Enter the file path to save the result (or just simulate saving): ");
    console.log(`Output file saved to ${outputFilePath}:\n`, resultMatrix.saveToFile());

    rl.close();
}

// Run the matrix operation function
performCalculations().catch(error => {
    console.error("Error:", error.message);
    rl.close();
});
