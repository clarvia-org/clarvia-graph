#!/usr/bin/env node

/**
 * Clarvia Graph CLI
 *
 * Early alpha tooling for validating and building the Clarvia consequence graph.
 *
 * Commands:
 *   validate              JSON Schema validation against YAML graph files
 *   lint-ids              ID grammar and length checks
 *   check-references      Verify all _refs point to existing records (planned)
 *   check-anchors         Verify assertion anchors exist in snapshots (planned)
 *   check-publication-gate  Publication gate validation (planned)
 *   check-contradictions  Flag overlapping conflicting claims (planned)
 *   test-scenarios        Run scenario regression tests (planned)
 *   build-checklist       Generate checklist for test scenarios (planned)
 */

const command = process.argv[2];

switch (command) {
  case "validate": {
    const { main } = await import("./commands/validate.js");
    await main();
    break;
  }

  case "lint-ids": {
    const { main } = await import("./commands/lint-ids.js");
    await main();
    break;
  }

  case "check-references": {
    const { main } = await import("./commands/check-references.js");
    await main();
    break;
  }

  case "check-anchors":
    console.log("clarvia check-anchors — not yet implemented (Sprint 2)");
    process.exit(0);
    break;

  case "check-publication-gate":
    console.log(
      "clarvia check-publication-gate — not yet implemented (Sprint 2)"
    );
    process.exit(0);
    break;

  case "check-contradictions":
    console.log(
      "clarvia check-contradictions — not yet implemented (Sprint 3)"
    );
    process.exit(0);
    break;

  case "test-scenarios":
    console.log("clarvia test-scenarios — not yet implemented (Sprint 3)");
    process.exit(0);
    break;

  case "build-checklist": {
    const { main } = await import("./commands/build-checklist.js");
    await main();
    break;
  }

  case undefined:
  case "--help":
  case "-h":
    console.log(`
Clarvia Graph CLI (alpha)

Usage: clarvia <command>

Commands:
  validate              Validate YAML files against JSON Schemas
  lint-ids              Check ID grammar and length rules
  check-references      Verify all references point to existing records
  check-anchors         Verify assertion anchors exist in snapshots
  check-publication-gate  Check publication gate requirements
  check-contradictions  Detect overlapping conflicting claims
  test-scenarios        Run scenario regression tests
  build-checklist       Generate checklist output for test scenarios

This is early alpha tooling. Not all commands are implemented yet.
`);
    process.exit(0);
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error("Run 'clarvia --help' for available commands.");
    process.exit(1);
}
