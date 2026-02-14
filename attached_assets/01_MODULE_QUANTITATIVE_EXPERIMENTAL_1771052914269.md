# SAGE MODULE: QUANTITATIVE EXPERIMENTAL
**Module 01 - Randomized Controlled Trials, Experiments, Clinical Trials**
**Version 3.0**
**Last Updated: February 2026**

---

## MODULE SCOPE

This module applies to:
- **Randomized Controlled Trials (RCTs)** - Clinical trials, intervention studies
- **Quasi-Experimental Studies** - Non-randomized interventions with controls
- **Laboratory Experiments** - Controlled manipulation of variables
- **Field Experiments** - Real-world randomized interventions
- **A/B Testing Studies** - Digital experiments with random assignment

**Key Characteristic**: Researcher actively **manipulates** an independent variable and measures effects on dependent variables with **control conditions**.

---

## DOCUMENT CLASSIFICATION

### Auto-Detection Keywords:
```
Primary Triggers (High Confidence):
- "randomized controlled trial", "RCT"
- "random assignment", "randomly assigned"
- "experimental group", "control group"
- "intervention", "treatment group"
- "double-blind", "single-blind", "blinding"
- "placebo", "placebo-controlled"
- "CONSORT", "trial registration"

Secondary Triggers (Medium Confidence):
- "experiment", "experimental design"
- "manipulation check"
- "controlled experiment"
- "between-subjects", "within-subjects"
- "factorial design"
```

### Sub-Types Within This Module:

**1. Randomized Controlled Trial (RCT)**
- Gold standard for causal inference
- Clinical/medical interventions
- Requires trial registration BEFORE first participant
- CONSORT 2025 compliance mandatory

**2. Quasi-Experimental**
- Intervention study without full randomization
- Control group present but not randomly assigned
- Common when randomization is unethical/impractical
- Requires careful confound discussion

**3. Laboratory Experiment**
- Controlled manipulation in lab setting
- Psychology, neuroscience, HCI
- May use student samples (generalizability limitation)

**4. Field Experiment**
- Randomized intervention in natural setting
- Education, public health, development economics
- Ecological validity higher than lab

---

## PHASE 1: INTRODUCTION ANALYSIS

### Research Question Requirements

**Must Be Testable with Causal Design**:
```
✓ GOOD: "Does cognitive behavioral therapy reduce anxiety symptoms 
  compared to waitlist control in adults with GAD?"
  (Testable, specific intervention, clear outcome, defined population)

✗ POOR: "What factors influence anxiety?"
  (Too broad, not testing specific intervention)

✗ POOR: "Is there a relationship between therapy and anxiety?"
  (Correlational framing, not intervention language)
```

**Components of Strong RCT Research Question**:
1. **Population**: Specific, inclusion/exclusion criteria clear
2. **Intervention**: Precisely defined treatment/manipulation
3. **Comparison**: What is the control condition?
4. **Outcome**: Primary endpoint clearly stated
5. **Timeframe**: When is outcome measured?

**PICO Framework** (Clinical RCTs):
- **P**opulation: Who?
- **I**ntervention: What treatment?
- **C**omparison: Compared to what?
- **O**utcome: What effect measured?

### Hypothesis Formulation

**Directional vs Non-Directional**:
```
Directional (predicted direction):
"We hypothesized that participants receiving the intervention would show 
significantly lower anxiety scores than control group participants."

Non-Directional (two-tailed):
"We hypothesized that anxiety scores would differ significantly between 
intervention and control groups."
```

**When to use directional**: Strong theoretical/empirical basis for prediction
**When to use non-directional**: Exploratory or when direction uncertain

**Null Hypothesis** (Should be implicit, not always stated):
- H₀: No difference between groups
- H₁: Difference exists between groups

### Gap Statement for Experimental Studies

**Must Justify WHY Experiment Is Needed**:
```
✓ "While correlational studies suggest X is associated with Y, no 
  randomized trial has tested whether manipulating X causally affects Y."

✓ "Previous interventions tested A and B separately, but their combined 
  effect remains unknown."

✓ "Observational data indicate a relationship, but confounds prevent 
  causal conclusions. An RCT is needed to establish causation."
```

---

## PHASE 2: METHODS SECTION - CONSORT 2025 COMPLIANCE

**CRITICAL**: All RCTs must comply with **CONSORT 2025** (30 items)

Full Checklist: https://pmc.ncbi.nlm.nih.gov/articles/PMC11996237/

### CONSORT 2025 Key Items to Verify:

#### Item 2a: Trial Design Description
```
REQUIRED: Clearly state design type

Examples:
"Parallel group randomized controlled trial with 1:1 allocation"
"2×2 factorial RCT examining two interventions independently and combined"
"Crossover RCT with 4-week washout period"
```

**Flag if missing**: Design type not explicitly stated

#### Item 3a: Participants - Eligibility Criteria
```
REQUIRED: 
- Inclusion criteria (who CAN participate)
- Exclusion criteria (who CANNOT participate)
- Settings and locations where data collected

Example:
"Inclusion criteria: Adults aged 18-65 with diagnosed GAD (DSM-5 criteria), 
GAD-7 score ≥10, fluent in English. Exclusion criteria: Current psychotic 
disorder, active suicidal ideation, concurrent psychotherapy."
```

**Common Error**: Vague criteria ("adults with anxiety")

#### Item 4a: Interventions - Detailed Description
```
REQUIRED for EACH arm:
- Name and rationale
- Dose/intensity
- Duration and frequency
- Mode of delivery (in-person, online, etc.)
- Who delivered it (training/qualifications)
- Fidelity monitoring

Example:
"Intervention: 12 weekly 50-minute sessions of individual CBT delivered 
by licensed clinical psychologists (≥5 years experience). Treatment followed 
standardized protocol (Author, 2020) including cognitive restructuring and 
exposure therapy. Fidelity monitored via random session recordings with 
adherence scores ≥85% required.

Control: Waitlist control with weekly 5-minute check-in calls for safety 
monitoring."
```

**Critical Error**: Insufficient detail for replication

#### Item 7a: Sample Size Calculation
```
REQUIRED:
- How sample size was determined
- Alpha level (typically .05)
- Desired power (typically .80 or .90)
- Expected effect size with justification
- Accounting for attrition
- Statistical test used for calculation

Example:
"Sample size calculation: To detect a medium effect size (d = 0.5) with 
80% power at α = .05 using independent samples t-test, 64 participants 
per group (128 total) were required (G*Power 3.1). Accounting for 20% 
attrition, we aimed to recruit 160 participants (80 per group)."
```

**Red Flag**: No sample size justification OR post-hoc power analysis

#### Item 8a: Randomization - Sequence Generation
```
REQUIRED:
- Method used to generate random allocation sequence
- Who generated the sequence
- When it was generated (BEFORE first participant)

Example:
"Randomization sequence was computer-generated by an independent 
statistician using permuted blocks of size 4, stratified by sex and 
baseline severity (GAD-7 <15 vs ≥15), before recruitment began."
```

**Common Errors**:
- ❌ "Participants were randomly assigned" (no method specified)
- ❌ Alternating assignment (NOT random)
- ❌ Assignment based on availability (NOT random)

#### Item 9: Allocation Concealment
```
REQUIRED:
- Mechanism used to conceal allocation sequence until assignment
- Who implemented randomization
- When allocation occurred

Example:
"Allocation was concealed using sequentially numbered, opaque, sealed 
envelopes prepared by an independent administrator. Envelopes were opened 
sequentially only after participant completed baseline assessment and 
provided consent."
```

**Gold Standard**: Central randomization via web/phone system
**Acceptable**: Sealed opaque envelopes (if properly implemented)
**Unacceptable**: Open allocation lists, unsealed envelopes

#### Item 11a: Blinding
```
REQUIRED:
- Who was blinded (participants, therapists, assessors, analysts)
- How blinding was implemented
- If blinding was not possible, why

Example:
"Outcome assessors and data analysts were blinded to group allocation. 
Participants and therapists could not be blinded due to the nature of 
the intervention (psychotherapy). To minimize bias, all outcomes were 
self-report questionnaires completed by participants without therapist 
presence."
```

**Blinding Levels**:
- **Single-blind**: Participants OR assessors blinded
- **Double-blind**: Participants AND assessors blinded
- **Triple-blind**: Participants, assessors, AND analysts blinded

**When Blinding Impossible**: Acknowledge and describe bias mitigation

#### Item 12a: Statistical Methods
```
REQUIRED:
- Statistical test for each outcome
- How missing data handled
- Sensitivity analyses planned
- Adjustment for multiple comparisons (if applicable)
- Whether analysis was ITT or per-protocol

Example:
"Primary outcome (GAD-7 change score) analyzed using independent samples 
t-test. Secondary outcomes analyzed using ANCOVA controlling for baseline 
scores. Missing data handled via multiple imputation (20 imputations). 
Analyses followed intention-to-treat principle (all randomized participants 
included). Benjamini-Hochberg correction applied to secondary outcomes 
(FDR = .05)."
```

#### Item 13a: Flow Diagram (CONSORT Flow)
```
REQUIRED: Visual diagram showing participant flow through trial

Must show:
- Number assessed for eligibility
- Number excluded (with reasons)
- Number randomized to each group
- Number receiving allocated intervention
- Number lost to follow-up (with reasons)
- Number analyzed in each group

Template available at: https://www.consort-statement.org/consort-2010-flow-diagram
```

**Critical Error**: Missing flow diagram (instant desk rejection at many journals)

#### Item 17a: Primary Outcome Results
```
REQUIRED for PRIMARY outcome:
- Exact p-value (not just p < .05)
- Effect size with interpretation
- 95% Confidence Interval
- Group means and SDs at each timepoint

Example:
"The intervention group showed significantly greater reduction in GAD-7 
scores (M = 12.3, SD = 4.2) compared to control group (M = 8.5, SD = 3.9) 
at post-treatment, t(156) = 5.73, p < .001, d = 0.94, 95% CI [0.61, 1.27], 
representing a large effect."
```

#### Item 18: Secondary Outcomes
- Report same statistics as primary outcome
- Note any non-significant findings (don't hide them)
- Apply multiple comparison correction

#### Item 19: Harms/Adverse Events
```
REQUIRED:
- All adverse events in each group
- Frequency and type
- Severity grading

Example:
"Adverse events: Intervention group: 3 participants reported temporary 
increase in anxiety during exposure exercises (mild, resolved within 48 
hours). Control group: 1 participant reported worsening suicidal ideation 
(serious, participant immediately referred to crisis services and withdrawn 
from study)."
```

**Critical Error**: No mention of harms/adverse events

#### Items 25-28: Open Science Section (NEW in CONSORT 2025)

**Item 25: Trial Registration**
```
REQUIRED:
- Trial registry name and number
- Date of registration (MUST be before first participant enrolled)
- URL to registration

Example:
"This trial was prospectively registered at ClinicalTrials.gov 
(NCT04567890) on March 15, 2024, before enrolling the first participant 
(April 2, 2024). https://clinicaltrials.gov/study/NCT04567890"
```

**Red Flag**: Retrospective registration (after enrollment began)

**Item 26: Protocol Access**
```
REQUIRED: State where full protocol can be accessed

Example:
"The full trial protocol is available at: https://osf.io/abc123/"
```

**Item 27: Statistical Analysis Plan (SAP)**
```
REQUIRED: State where SAP can be accessed

Example:
"The statistical analysis plan is available at: https://osf.io/xyz789/"
```

**Item 28: Data Sharing Statement**
```
REQUIRED: State whether individual participant data will be shared

Examples:
"Individual participant data will be made available upon reasonable request 
to the corresponding author, following publication and with appropriate data 
sharing agreement."

OR

"De-identified individual participant data will be publicly available at 
OSF (https://osf.io/data123/) 6 months after publication."
```

---

## PHASE 3: STATISTICAL ANALYSIS REQUIREMENTS

### A Priori Power Analysis (MANDATORY)

**Must Include**:
1. **Effect size**: Expected magnitude with justification
   - From pilot data
   - From previous literature
   - From smallest effect of interest

2. **Alpha level**: Typically .05 (one-tailed or two-tailed stated)

3. **Desired power**: Typically .80 or .90

4. **Statistical test**: Specific test used in calculation

5. **Sample size result**: N per group and total N

**Example**:
```
"A priori power analysis using G*Power 3.1 indicated that 128 total 
participants (64 per group) would provide 80% power to detect a medium 
effect (d = 0.5) at α = .05 (two-tailed) using independent samples t-test. 
Effect size was based on meta-analysis of similar CBT interventions 
(Smith et al., 2023, d = 0.52)."
```

**Red Flag**: Post-hoc power analysis (circular reasoning - don't do this)

### Primary vs Secondary Outcomes

**Primary Outcome**:
- ONE clearly designated primary outcome
- Pre-specified in registration and protocol
- Sample size calculated for this outcome
- Alpha = .05 without correction

**Secondary Outcomes**:
- Can have multiple
- Require correction for multiple comparisons
- Should be clearly labeled as secondary/exploratory

**Fishing Expedition Detection**:
```
Red Flags:
- Multiple outcomes all labeled "primary"
- Outcomes not mentioned in registration
- HARKing: "Hypothesis After Results Known"
- P-hacking: Selective reporting of significant results
```

### Statistical Tests for Experimental Designs

#### Between-Subjects Designs

**Two Groups**:
```
Continuous outcome → Independent samples t-test
  Report: t(df), p-value, Cohen's d, 95% CI

Binary outcome → Chi-square test or Fisher's exact
  Report: χ²(df), p-value, odds ratio, 95% CI
```

**Three or More Groups**:
```
Continuous outcome → One-way ANOVA
  Report: F(df1, df2), p-value, η² or ω²
  Follow-up: Planned contrasts or post-hoc tests (with correction)

Binary outcome → Chi-square test
  Report: χ²(df), p-value
```

#### Within-Subjects Designs

**Two Timepoints**:
```
Paired samples t-test
Report: t(df), p-value, Cohen's dz (within-subjects effect size), 95% CI
```

**Three or More Timepoints**:
```
Repeated measures ANOVA
Report: F(df1, df2), p-value, partial η²
Sphericity: Report Mauchly's test; use Greenhouse-Geisser correction if violated
```

#### Mixed Designs (Between + Within)

```
Mixed ANOVA (e.g., 2 groups × 3 timepoints)
Report:
- Main effect of group: F(df1, df2), p, partial η²
- Main effect of time: F(df1, df2), p, partial η²
- Group × Time interaction: F(df1, df2), p, partial η²

Interaction is typically most interesting for RCTs
```

#### Covariates (ANCOVA)

```
When to use: Control for baseline differences or known confounds

Example:
"ANCOVA controlling for baseline GAD-7 scores: F(1, 155) = 32.87, 
p < .001, partial η² = .175"

Report: Adjusted means, not raw means
```

### Effect Size Requirements (CRITICAL)

**APA 7th mandates effect sizes with ALL statistical tests**

#### Between-Subjects:

**Cohen's d** (two groups):
```
Small: d = 0.2
Medium: d = 0.5  
Large: d = 0.8

Calculate: (M₁ - M₂) / SDpooled

Report with 95% CI:
"d = 0.72, 95% CI [0.38, 1.06]"
```

**Hedges' g** (small samples, <20 per group):
```
Corrects upward bias in Cohen's d
Use for meta-analysis compatibility
```

**Partial η²** (ANOVA):
```
Small: .01
Medium: .06
Large: .14

Calculate: SSeffect / (SSeffect + SSerror)
```

#### Within-Subjects:

**Cohen's dz** (paired samples):
```
Calculate: Mdiff / SDdiff
Larger than between-subjects d because it accounts for correlation
```

#### Clinical Trials:

**Number Needed to Treat (NNT)**:
```
NNT = 1 / (risk in control - risk in intervention)

Example: If 60% improve with treatment vs 40% with control
NNT = 1 / (.60 - .40) = 1 / .20 = 5
"5 people need to be treated for 1 additional person to benefit"
```

**Odds Ratio (OR)** / **Risk Ratio (RR)** / **Hazard Ratio (HR)**:
```
OR > 1: Increased odds of outcome
OR = 1: No association  
OR < 1: Decreased odds of outcome

Always report 95% CI:
"OR = 2.34, 95% CI [1.45, 3.78]"
```

### Confidence Intervals (ALWAYS Report)

**95% CI is standard** (90% for equivalence testing)

**Interpretation**:
- Wide CI = Imprecise estimate (small sample, high variability)
- Narrow CI = Precise estimate (large sample, low variability)
- CI excluding null value = Statistically significant

**Non-Significant Result with Wide CI**:
```
"No significant difference was found, t(48) = 1.23, p = .224, d = 0.35, 
95% CI [-0.22, 0.92]. However, the wide confidence interval indicates 
the study was underpowered, and a small-to-medium effect cannot be ruled out."
```

### Multiple Comparisons Correction

**When Required**: Testing multiple hypotheses increases Type I error rate

**Bonferroni Correction**:
```
Most conservative
Adjusted alpha = α / number of tests

Example: 5 tests at α = .05
Corrected alpha = .05 / 5 = .01
```

**Holm Step-Down**:
```
More powerful than Bonferroni
Uniformly better - generally preferred
```

**Benjamini-Hochberg (FDR)**:
```
False Discovery Rate control
Less conservative
Best for exploratory research with many tests
```

**When NOT to Correct**:
- ONE pre-specified primary outcome (no correction needed)
- Planned contrasts (theoretical, not data-driven)

### Intention-to-Treat (ITT) Analysis

**Gold Standard for RCTs**:
```
Analyze ALL randomized participants in their assigned groups
Regardless of:
- Whether they received intervention
- Whether they completed treatment  
- Whether they were compliant
- Whether they withdrew
```

**Why ITT Matters**: Preserves randomization, prevents bias

**Per-Protocol Analysis**:
```
Analyze only participants who completed intervention as planned
Can be reported AS SENSITIVITY ANALYSIS
Should NOT be primary analysis
```

**Example Statement**:
```
"All analyses followed intention-to-treat principles. All 160 randomized 
participants were included in analyses regardless of treatment completion 
or adherence. Sensitivity analyses using per-protocol approach (n = 142 
completers) yielded similar results."
```

### Missing Data Handling

**Not Acceptable**:
- ❌ Complete case analysis (listwise deletion) - biases results
- ❌ Ignoring missingness - violates ITT

**Acceptable Methods**:

**Multiple Imputation** (Gold Standard):
```
Creates multiple plausible datasets
Pools results across imputations
Accounts for uncertainty

Report:
"Missing data (12% of observations) were handled using multiple imputation 
with 20 imputed datasets. Variables included in imputation model: [list]."
```

**Maximum Likelihood Estimation**:
```
Mixed models inherently handle missing data
No need for separate imputation
Assumes data Missing at Reasonable (MAR)
```

**Last Observation Carried Forward (LOCF)**:
```
Conservative assumption
Underestimates treatment effect
Only if dropout is treatment-related
Report as sensitivity analysis
```

**Report Missingness**:
```
ALWAYS report:
- % missing per variable per group
- Reasons for missingness
- Whether missingness differs by group (test this)
- Assumption about missing data mechanism (MCAR, MAR, MNAR)
```

---

## PHASE 4: RESULTS SECTION STRUCTURE

### Results Organization for RCTs

**Standard Order**:

1. **Participant Flow** (refer to CONSORT diagram)
   ```
   "Between April and December 2024, 287 individuals were assessed for 
   eligibility. Of these, 127 were excluded (reasons shown in Figure 1). 
   160 participants were randomized (80 per group). Follow-up data were 
   collected for 142 participants (89% retention; 71 intervention, 71 control)."
   ```

2. **Baseline Characteristics** (Table 1)
   ```
   Present demographics and clinical variables by group
   Test for baseline differences (should be minimal due to randomization)
   Report: "Groups did not differ significantly at baseline on any 
   measured variable (all p > .05)"
   ```

3. **Primary Outcome Analysis**
   ```
   Report FULLY:
   - Descriptive statistics (M, SD) per group per timepoint
   - Statistical test result
   - Exact p-value  
   - Effect size with CI
   - Clinical interpretation if applicable (NNT, % improvement)
   ```

4. **Secondary Outcome Analyses**
   ```
   Same detail as primary
   Note correction for multiple comparisons
   ```

5. **Subgroup Analyses** (if pre-specified)
   ```
   Test for interaction, not separate tests per subgroup
   Report: "No significant Sex × Group interaction, F(1, 154) = 0.87, p = .353"
   ```

6. **Adverse Events/Harms**
   ```
   Table showing frequency of each AE per group
   Statistical comparison if appropriate
   ```

### Baseline Characteristics Table

**Required Elements**:
```
Table 1. Baseline Characteristics by Group

Variable            | Intervention (n=80) | Control (n=80) | p-value
--------------------|---------------------|----------------|--------
Age, M (SD)         | 34.2 (8.7)         | 35.1 (9.2)     | .523
Female, n (%)       | 52 (65)            | 48 (60)        | .510
GAD-7, M (SD)       | 14.8 (3.2)         | 14.3 (3.5)     | .342
Prior therapy, n (%)| 31 (39)            | 28 (35)        | .613

Note: No significant baseline differences (all p > .05). GAD-7 = Generalized 
Anxiety Disorder-7 scale.
```

**What to Include**:
- Age, sex/gender
- Relevant clinical variables
- Baseline scores on all outcome measures
- Any stratification variables

**Statistical Test**:
- Continuous: Independent samples t-test
- Categorical: Chi-square test
- Expect p > .05 (randomization worked)

**If Significant Baseline Difference**:
```
"Despite randomization, groups differed on baseline severity, t(158) = 2.34, 
p = .021. This variable was included as a covariate in primary analysis."
```

### Primary Outcome Results Template

```
[Remind → Describe → Explain pattern]

REMIND: "To test whether CBT reduces anxiety symptoms compared to waitlist 
control, we analyzed change in GAD-7 scores from baseline to post-treatment."

DESCRIBE: "Independent samples t-test revealed a significant group difference 
in GAD-7 change scores, t(158) = 5.73, p < .001, d = 0.94, 95% CI [0.61, 1.27]. 
See Figure 2."

EXPLAIN: "The intervention group showed significantly greater symptom reduction 
(M = -8.5 points, SD = 4.2) compared to control group (M = -3.2 points, 
SD = 3.9). This represents a large effect size and clinically meaningful change 
(>5 points on GAD-7)."

CLINICAL SIGNIFICANCE: "Using a 50% symptom reduction criterion, 62% of 
intervention participants achieved clinically significant improvement compared 
to 23% of controls (NNT = 2.6)."
```

---

## PHASE 5: DISCUSSION SECTION - CAUSAL LANGUAGE

### CRITICAL DIFFERENCE: Experiments CAN Claim Causation

**Unlike observational studies, properly conducted RCTs establish causation**

**Causal Language IS ALLOWED**:
```
✓ "CBT caused significant anxiety reduction"
✓ "The intervention produced symptom improvement"  
✓ "Cognitive training increased working memory capacity"
✓ "The treatment led to faster recovery"
✓ "X reduced Y"
✓ "Manipulating X resulted in changes in Y"
```

**Required Conditions for Causal Claims**:
1. Random assignment (not just random selection)
2. Control group present
3. Manipulation of IV occurred
4. Temporal precedence (IV before DV)
5. Alternative explanations ruled out

### When to Hedge Even in RCTs

**Generalizability**:
```
✓ "CBT caused anxiety reduction in this sample of treatment-seeking adults"
✗ "CBT causes anxiety reduction in all people"
```

**Mechanism Unclear**:
```
✓ "The intervention improved symptoms, although the specific mechanism 
   (cognitive change vs behavioral activation) remains unclear"
```

**Compliance Issues**:
```
✓ "Among participants who completed ≥8 sessions (per-protocol), the treatment 
   effect was larger, suggesting dose-response relationship"
```

**Unexpected Null Results**:
```
✓ "Contrary to hypotheses, the intervention did not significantly improve 
   secondary outcomes. This may reflect measurement insensitivity or suggest 
   effects are specific to primary domain."
```

### Comparing RCT Results to Observational Literature

**Template**:
```
"Our RCT provides causal evidence supporting previous correlational findings. 
Smith et al. (2022) observed an association between X and Y, but confounds 
precluded causal inference. By randomly assigning participants, our study 
demonstrates that X causally affects Y, with a magnitude (d = 0.72) consistent 
with Smith's correlational estimate (r = .36)."
```

### Limitations Specific to Experimental Designs

**Ecological Validity**:
```
"The controlled laboratory setting may limit generalizability to real-world 
contexts where multiple confounds operate simultaneously."
```

**Sample Characteristics**:
```
"Participants were predominantly college students (convenience sample), which 
limits generalizability to broader adult populations."
```

**Intervention Fidelity**:
```
"While we monitored treatment fidelity, naturalistic implementation may vary."
```

**Attrition**:
```
"Differential attrition (18% intervention vs 12% control) may bias results, 
although sensitivity analyses suggest robustness."
```

**Short-Term Follow-Up**:
```
"Effects were measured immediately post-treatment; long-term maintenance unknown."
```

---

## PHASE 6: QUASI-EXPERIMENTAL DESIGNS

**When Used**: Randomization impossible/unethical/impractical

**Examples**:
- Pre-existing groups (classroom intervention)
- Self-selection into treatment
- Regression discontinuity designs
- Interrupted time series

### Critical Differences from RCTs:

1. **NO random assignment** (by definition)
2. **Confounds more likely** (groups may differ at baseline)
3. **Causal language MUST be hedged** (more like observational studies)
4. **Requires explicit confound discussion**

### Required Confound Analysis:

```
"Because participants were not randomly assigned, groups differed at baseline 
on [variable]. We controlled for this using ANCOVA, but unmeasured confounds 
may remain. Propensity score matching was attempted but [result]."
```

### Quasi-Experimental Language:

```
✓ "The intervention was associated with improved outcomes"
✓ "Results suggest the program may have contributed to gains"
✓ "After accounting for baseline differences, treatment predicted..."

✗ "The intervention caused improvement" (too strong without randomization)
```

### Strengthening Quasi-Experimental Designs:

**Propensity Score Matching**:
```
Match treatment/control participants on confound variables
Report: "Propensity scores were calculated using logistic regression 
(covariates: age, baseline severity, SES). Nearest-neighbor matching 
yielded 64 matched pairs."
```

**Difference-in-Differences**:
```
Compare change over time in treatment vs control
Controls for pre-existing differences
```

**Regression Discontinuity**:
```
Treatment assigned based on cutoff score
Compare outcomes just above vs below cutoff
Approximates random assignment near cutoff
```

---

## COMMON ERRORS IN EXPERIMENTAL RESEARCH

### Error 1: Violation of Random Assignment

```
❌ "Participants chose which group to join"
❌ "Groups were assigned based on scheduling convenience"
❌ "First 50 participants received treatment A, next 50 received B"

These are quasi-experimental, NOT true experiments
Must be labeled and analyzed accordingly
```

### Error 2: Manipulation Check Absent

**For psychological experiments**: Verify manipulation worked

```
Example: If manipulating stress, measure stress
"Manipulation check confirmed the stress induction was effective: stressed 
group reported higher anxiety (M = 6.2) than control (M = 2.1), t(98) = 14.32, 
p < .001."
```

### Error 3: Multiple Comparisons Uncorrected

```
❌ "We tested 15 outcomes; 3 were significant at p < .05"
   (Expected by chance alone: 15 × .05 = 0.75 false positives)

✓ "We tested 15 outcomes with Benjamini-Hochberg correction (FDR = .05); 
   3 remained significant after correction."
```

### Error 4: HARKing (Hypothesizing After Results Known)

**Red Flags**:
- Hypotheses perfectly match results
- No null findings reported
- Outcomes not in trial registration

**Prevention**: Pre-register hypotheses

### Error 5: Insufficient Intervention Description

```
❌ "Participants received CBT"
✓ "Participants received 12 weekly sessions of individual CBT following 
   the protocol by Beck et al. (2020), delivered by licensed psychologists 
   with ≥5 years experience. Sessions included [components]."
```

### Error 6: Ignoring Assumptions

**t-test assumptions**:
- Independence ✓ (randomization ensures this)
- Normality (test with Shapiro-Wilk; robust with n>30)
- Homogeneity of variance (test with Levene's; use Welch's t if violated)

**ANOVA assumptions**:
- Independence ✓
- Normality (per group)
- Homogeneity of variance (Levene's test)
- Sphericity (repeated measures only; use Greenhouse-Geisser if violated)

**Report assumption violations**:
```
"Levene's test indicated unequal variances, F(1, 158) = 6.73, p = .010. 
Therefore, Welch's t-test was used: t(148.3) = 5.21, p < .001."
```

---

## FIELD-SPECIFIC VARIATIONS

### Biomedical/Clinical RCTs

**Additional Requirements**:
- Trial registration (ClinicalTrials.gov) MANDATORY before first patient
- Ethics approval with protocol number
- Informed consent documentation
- CONSORT compliance strictly enforced
- Primary endpoint must be clinically meaningful (not just statistically significant)
- Safety monitoring board for serious interventions
- Stopping rules for early efficacy or futility

**Journals**: NEJM, Lancet, JAMA, BMJ require CONSORT

### Psychology Experiments

**Common Designs**:
- Between-subjects manipulation (random assignment to conditions)
- Within-subjects manipulation (all participants in all conditions)
- Mixed designs

**Deception Issues**:
- If deception used, debriefing REQUIRED
- Ethics approval must cover deception
- Report in Methods: "Participants were debriefed immediately following the 
  experiment and given opportunity to withdraw data."

**Student Samples**:
- Very common in psychology
- Acknowledge as limitation: "College student sample limits generalizability"

### Education Field Experiments

**Cluster Randomization**:
- Often randomize schools/classrooms, not individuals
- ICC (intraclass correlation) must be reported
- Analysis must account for clustering (multilevel models)

**Example**:
```
"Schools (n = 24) were randomly assigned to intervention or control. 
Multilevel modeling accounted for student nesting within schools. 
ICC = .18, indicating 18% of variance at school level."
```

### HCI/Technology Experiments

**A/B Testing**:
- Large online samples (thousands)
- Minimal interaction effects
- Report: conversion rates, click-through rates, engagement metrics

**Lab Studies**:
- Controlled task performance
- Usability metrics (time, errors, satisfaction)
- Often within-subjects for efficiency

**Example**:
```
"Participants completed tasks with both interface designs (order counterbalanced). 
Task completion time was significantly faster with Design A (M = 34.2s) vs 
Design B (M = 41.7s), t(47) = 3.89, p < .001, dz = 0.56."
```

---

## CONSORT-AI EXTENSION (For AI Interventions)

**When to Use**: RCT testing an AI-based intervention

**Additional Items** (14 total):

1. **AI System Description**: Architecture, input/output, version
2. **Training Data**: What data AI was trained on
3. **Performance Metrics**: Sensitivity, specificity, AUC before deployment
4. **Human-AI Interaction**: How humans use AI output
5. **AI Failures**: How errors were detected and handled
6. **Comparison**: AI vs standard care OR AI vs human expert

**Full Checklist**: https://pubmed.ncbi.nlm.nih.gov/32908283/

**Example**:
```
"The AI system (Version 2.1) was a convolutional neural network trained on 
10,000 annotated chest X-rays (AUC = 0.94 on validation set). Radiologists 
received AI predictions alongside X-rays but made final diagnoses independently. 
AI failures (predictions flagged as low confidence) occurred in 3.2% of cases."
```

---

## RESOURCES FOR QUANTITATIVE EXPERIMENTAL RESEARCH

### Core Standards
- CONSORT 2025 Statement: https://pmc.ncbi.nlm.nih.gov/articles/PMC11996237/
- CONSORT Flow Diagram: https://www.consort-statement.org/consort-2010-flow-diagram
- CONSORT-AI Extension: https://pubmed.ncbi.nlm.nih.gov/32908283/

### Trial Registration
- ClinicalTrials.gov: https://clinicaltrials.gov/
- WHO ICTRP: https://www.who.int/clinical-trials-registry-platform

### Sample Size Calculation
- G*Power (free software): https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower

### Statistical Reporting
- APA 7th Statistics Guide: https://apastyle.apa.org/instructional-aids/numbers-statistics-guide.pdf

### Effect Sizes
- Effect Size Calculators: https://www.psychometrica.de/effect_size.html
- ESCI (Exploratory Software for CIs): https://thenewstatistics.com/itns/esci/

### Causal Inference
- Being Honest with Causal Language: https://onlinelibrary.wiley.com/doi/10.1111/jan.14311

---

**END OF MODULE 01: QUANTITATIVE EXPERIMENTAL**

*This module covers RCTs, experiments, and quasi-experimental designs. For observational/correlational studies without experimental manipulation, use MODULE 02: OBSERVATIONAL.*

**Version**: 3.0
**Last Updated**: February 2026
**Maintained By**: SAGE Development Team
