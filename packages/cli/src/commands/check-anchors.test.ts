import { describe, it, expect, beforeAll } from "vitest";
import { resolve } from "node:path";
import { runCheckAnchors } from "./check-anchors.js";

const ROOT_DIR = resolve(import.meta.dirname!, "..", "..", "..", "..");

describe("runCheckAnchors characterization", () => {
  let results: Awaited<ReturnType<typeof runCheckAnchors>>["results"];
  let errors: number;

  // Run once, share across tests
  beforeAll(async () => {
    const out = await runCheckAnchors({ rootDir: ROOT_DIR });
    results = out.results;
    errors = out.errors;
  }, 30_000);

  it("pins the total result count", () => {
    // Will fail on first run — update with actual value
    expect(results.length).toMatchInlineSnapshot(`77`);
  });

  it("pins the error count", () => {
    expect(errors).toMatchInlineSnapshot(`0`);
  });

  it("pins the found/not-found breakdown", () => {
    const found = results.filter((r) => r.found).length;
    const notFound = results.filter((r) => !r.found).length;
    expect({ found, notFound }).toMatchInlineSnapshot(`
      {
        "found": 77,
        "notFound": 0,
      }
    `);
  });

  it("pins the assertion IDs that were checked", () => {
    const ids = results.map((r) => r.assertionId).sort();
    expect(ids).toMatchInlineSnapshot(`
      [
        "assertion.cns_lu.death_funeral_costs.cns_claim_by_post",
        "assertion.cns_lu.death_funeral_costs.death_certificate_required",
        "assertion.cns_lu.death_funeral_costs.deceased_must_be_insured_or_coinsured",
        "assertion.cns_lu.death_funeral_costs.funeral_indemnity_covers_costs",
        "assertion.cns_lu.death_funeral_costs.paid_invoices_required",
        "assertion.eu.ejustice_succession.choice_of_nationality_law",
        "assertion.eu.ejustice_succession.cross_border_single_law_authority",
        "assertion.eu.ejustice_succession.ecs_recognised_in_member_states",
        "assertion.eu.ejustice_succession.habitual_residence_default_rule",
        "assertion.eu.ejustice_succession.regulation_applies_from_2015_08_17",
        "assertion.guichet_lu.accept_renounce_succession.heirs_not_obliged_to_accept",
        "assertion.guichet_lu.accept_renounce_succession.inventory_acceptance_limits_debts",
        "assertion.guichet_lu.accept_renounce_succession.inventory_three_months",
        "assertion.guichet_lu.accept_renounce_succession.reflection_forty_days",
        "assertion.guichet_lu.accept_renounce_succession.renunciation_at_court_registry",
        "assertion.guichet_lu.bereavement.death_must_be_declared",
        "assertion.guichet_lu.bereavement.declaration_within_24h",
        "assertion.guichet_lu.bereavement.survivor_pension_available",
        "assertion.guichet_lu.bereavement_leave.employee_entitled_to_extraordinary_leave",
        "assertion.guichet_lu.bereavement_leave.employee_must_request_leave",
        "assertion.guichet_lu.bereavement_leave.first_degree_relative_three_days",
        "assertion.guichet_lu.bereavement_leave.leave_taken_at_event",
        "assertion.guichet_lu.bereavement_leave.spouse_partner_death_three_days",
        "assertion.guichet_lu.declaration_succession.inheritance_declaration_required",
        "assertion.guichet_lu.funeral_allowance.allowance_amount_current_index",
        "assertion.guichet_lu.funeral_allowance.death_certificate_extract_required",
        "assertion.guichet_lu.funeral_allowance.deceased_must_be_health_insured",
        "assertion.guichet_lu.funeral_allowance.funeral_allowance_flat_rate",
        "assertion.guichet_lu.funeral_allowance.paid_invoices_and_death_extract_required",
        "assertion.guichet_lu.funeral_cremation.burial_or_cremation_before_72h",
        "assertion.guichet_lu.funeral_cremation.cremation_authorisation_required",
        "assertion.guichet_lu.funeral_cremation.cremation_medical_certificate_required",
        "assertion.guichet_lu.funeral_cremation.written_authorisation_required",
        "assertion.guichet_lu.income_tax_return.assessment_taxpayers_must_file",
        "assertion.guichet_lu.income_tax_return.filing_by_myguichet_or_post",
        "assertion.guichet_lu.income_tax_return.model_100_used",
        "assertion.guichet_lu.income_tax_return.return_due_31_december_following_year",
        "assertion.guichet_lu.inheritance_tax.aed_sends_payment_request",
        "assertion.guichet_lu.inheritance_tax.declaration_needed_for_tax_assessment",
        "assertion.guichet_lu.inheritance_tax.duties_vary_by_relationship_and_assets",
        "assertion.guichet_lu.inheritance_tax.tax_due_six_weeks_after_request",
        "assertion.guichet_lu.inheritance_tax.two_inheritance_tax_categories",
        "assertion.lu.acd_form100.email_not_accepted",
        "assertion.lu.acd_form100.model_100_required_for_assessment",
        "assertion.lu.acd_form100.myguichet_online_filing_available",
        "assertion.lu.acd_form100.pdf_or_postal_filing_available",
        "assertion.lu.aed_successions.death_transfer_taxes",
        "assertion.lu.aed_successions.heirs_and_legatees_liable",
        "assertion.lu.aed_successions.mutation_duty_on_luxembourg_immovables",
        "assertion.lu.aed_successions.succession_and_mutation_distinguished",
        "assertion.lu.aed_successions.succession_duty_on_luxembourg_inhabitant_estate",
        "assertion.lu.ccss_cessation.activity_stop_exit_declaration",
        "assertion.lu.ccss_cessation.employees_exit_declaration_each",
        "assertion.lu.ccss_cessation.exit_declaration_required_information",
        "assertion.lu.ccss_cessation.self_employed_must_notify_ccss",
        "assertion.lu.ccss_cessation.temporary_suspension_exit_declaration",
        "assertion.lu.cnap_survivor_pension.beneficiaries_subject_to_conditions",
        "assertion.lu.cnap_survivor_pension.cnap_may_pay_survivor_pension",
        "assertion.lu.cnap_survivor_pension.spouse_surviving_partner_or_orphans_listed",
        "assertion.lu.cnap_survivor_pension.survivor_pension_gender_neutral",
        "assertion.lu.cns_death_notification.coinsurance_ends_automatically",
        "assertion.lu.cns_death_notification.coinsurance_not_automatic_for_family",
        "assertion.lu.cns_death_notification.family_insurance_reexamined_after_death",
        "assertion.lu.cns_death_notification.survivor_pension_not_automatic",
        "assertion.lu.cns_death_notification.temporary_coverage_steps_may_be_needed",
        "assertion.lu.cssf_tracing_assets.cssf_not_competent_for_asset_tracing",
        "assertion.lu.cssf_tracing_assets.death_certificate_for_asset_search",
        "assertion.lu.cssf_tracing_assets.heirs_contact_banks_directly",
        "assertion.lu.cssf_tracing_assets.id_card_and_legal_document_for_asset_search",
        "assertion.lu.cssf_tracing_assets.representative_proxy_required",
        "assertion.lu.snca_inherit_vehicle.appointment_or_postal_submission",
        "assertion.lu.snca_inherit_vehicle.luxembourg_resident_heir_scope",
        "assertion.lu.snca_inherit_vehicle.new_registration_certificate_required",
        "assertion.lu.snca_inherit_vehicle.registration_application_form_required",
        "assertion.lu.snca_inherit_vehicle.succession_attestation_required",
        "assertion.service_public_fr.succession.notaire_obligatoire",
        "assertion.service_public_fr.succession.option_successorale",
      ]
    `);
  });

  it("snapshots the full results array for determinism", () => {
    // Sort for stability since glob order is not guaranteed
    const sorted = [...results].sort((a, b) =>
      a.assertionId.localeCompare(b.assertionId),
    );
    expect(sorted).toMatchSnapshot();
  });
});
