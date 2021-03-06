import { Command } from "commander";
import { read, write } from "fs";
import { cli } from "../src/cli";
import { FileIO } from "../src/deps/FileIO";
import { Failable } from "../src/Failable";
import prettier from "prettier";
import { Id } from "../src/deps/Id";

const format = (code: string) =>
  prettier.format(code, { parser: "typescript" });
const blankTestFileIO: FileIO = {
  write(p) {
    return Failable.success(undefined);
  },
  read(p) {
    return Failable.success("");
  },
};

const cliTestID = "the-id";
const testIdGenerator: Id = {
  generateId() {
    return cliTestID;
  },
};

describe(cli, () => {
  it("Should print help if passed the help flag", () => {
    let logs = "";
    let errors = "";
    let exited = false;

    console.log("Running CLI");
    expect(
      cli({
        deps: {
          commanderProgram: {
            exitOverride() {
              exited = true;
            },
          },
          fileIO: blankTestFileIO,
          args: {
            getArgs() {
              return ["-h"];
            },
            startsOnActualArguments: true,
          },
          logger: {
            log(text) {
              logs += `${text}\n`;
            },
            error(text) {
              errors += `${text}\n`;
            },
          },
          id: testIdGenerator,
        },
      })
    );

    expect(logs.includes("Usage: ")).toBeTruthy();
    expect(logs.includes(""));
    expect(exited).toBe(true);
  });

  it("Should correctly write the output to files when all passed", () => {
    let logs = "";
    let errors = "";
    let exited = false;
    let readCount = 0;
    let writeCount = 0;

    cli({
      deps: {
        fileIO: {
          read(fileName) {
            readCount++;
            expect(fileName).toBe("abc.tsr");
            return Failable.success(`export type Type = number;`);
          },
          write({ filePath, text }) {
            writeCount++;
            expect(filePath).toBe("xyz.tsr.ts");
            expect(format(text)).toBe(
              format(`export const Type_$TSR = {id: "${cliTestID}", type: "number" }`)
            );
            return Failable.success(undefined);
          },
        },
        args: {
          startsOnActualArguments: true,
          getArgs() {
            return ["abc.tsr", "-o", "xyz.tsr.ts"];
          },
        },
        commanderProgram: {
          exitOverride(err) {
            exited = true;
          },
        },
        logger: {
          error(text) {
            errors += `${text}\n`;
          },
          log(text) {
            logs += `${text}\n`;
          },
        },
        id: testIdGenerator,
      },
    });

    expect(exited).toBe(false);
    expect(readCount).toBe(1);
    expect(writeCount).toBe(1);
  });

  it("Should Exit if reading fails appropriate error messages", () => {
    let logs = "";
    let errors = "";
    let exited = false;
    let readCount = 0;

    cli({
      deps: {
        fileIO: {
          read(fileName) {
            readCount++;
            expect(fileName).toBe("abc.tsr");
            return Failable.failure("Couldn't read");
          },
          write({ filePath, text }) {
            fail("Shouldn't be writing");
          },
        },
        args: {
          startsOnActualArguments: true,
          getArgs() {
            return ["abc.tsr", "-o", "xyz.tsr.ts"];
          },
        },
        commanderProgram: {
          exitOverride(err) {
            exited = true;
          },
        },
        logger: {
          error(text) {
            errors += `${text}\n`;
          },
          log(text) {
            logs += `${text}\n`;
          },
        },
        id: testIdGenerator,
      },
    });

    expect(readCount).toBe(1);
    expect(errors.includes("Couldn't read")).toBe(true);
  });

  const testPrependFlag = (prepend: boolean) => () => {
    let logs = "";
    let errors = "";
    let exited = false;

    cli({
      deps: {
        fileIO: {
          read(fileName) {
            expect(fileName).toBe("abc.tsr");
            return Failable.success(`export type X = 1;`);
          },
          write({ text }) {
            expect(format(text)).toBe(
                format(prepend ? "export type X = 1;\n" : "" +
                    "export const X_$TSR = {\n" +
                    `    id: \"${cliTestID}\",\n` +
                    "    type: \"literal\",\n" +
                    "    typeLiteral: \"number\",\n" +
                    "    value: 1\n" +
                    "}")
            );
            return Failable.success(undefined);
          },
        },
        args: {
          startsOnActualArguments: true,
          getArgs() {
            return ["abc.tsr", "-p"];
          },
        },
        commanderProgram: {
          exitOverride(err) {
            exited = true;
          },
        },
        logger: {
          error(text) {
            errors += `${text}\n`;
          },
          log(text) {
            logs += `${text}\n`;
          },
        },
        id: testIdGenerator,
      },
    });

    expect(errors.length === 0).toBe(true);
  }

  it("Should prepend code from tsr file (when -p flag is passed)", testPrependFlag(true));
  it("Shouldn't prepend code from tsr file (when -p flag is not passed)", testPrependFlag(false));

  it.todo(
    "Should simply log the result if the -o flag is not passed and shouldn't perform any file writes"
  );
});
