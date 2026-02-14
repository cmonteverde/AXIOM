# SAGE MODULE: SYSTEMATIC REVIEWS
**Module 04 - Systematic Reviews, Meta-Analyses, Scoping Reviews**
**Version 3.0**
**Last Updated: February 2026**

---

## MODULE SCOPE

This module applies to:
- **Systematic Reviews** - Comprehensive synthesis of research on specific question
- **Meta-Analyses** - Statistical pooling of results from multiple studies
- **Scoping Reviews** - Mapping breadth of literature on broader topic
- **Narrative Systematic Reviews** - Synthesis without statistical pooling
- **Network Meta-Analyses** - Comparing multiple interventions
- **Living Systematic Reviews** - Continuously updated reviews

**Key Characteristic**: **Secondary research** synthesizing existing studies, NOT collecting new primary data.

---

## DOCUMENT CLASSIFICATION

### Auto-Detection Keywords:
```
Primary Triggers (High Confidence):
- "systematic review", "systematic literature review"
- "meta-analysis", "meta-analytic"
- "PRISMA", "PRISMA 2020"
- "PROSPERO", "protocol registration"
- "search strategy", "databases searched"
- "inclusion criteria", "exclusion criteria"
- "risk of bias", "quality assessment"
- "forest plot", "funnel plot"
- "effect size pooled", "pooled estimate"
- "heterogeneity", "I²", "tau²"

Secondary Triggers (Medium Confidence):
- "scoping review", "scoping study"
- "evidence synthesis"
- "GRADE", "certainty of evidence"
- "network meta-analysis"
- "living systematic review"
```

### Sub-Types Within This Module:

**1. Systematic Review (Without Meta-Analysis)**
- Narrative synthesis of findings
- No statistical pooling
- May use vote counting or qualitative synthesis

**2. Meta-Analysis**
- Statistical combination of effect sizes
- Forest plots required
- Heterogeneity assessment mandatory

**3. Scoping Review**
- Maps breadth of literature
- No quality assessment typically
- Broader questions than systematic reviews
- PRISMA-ScR (22 items)

**4. Network Meta-Analysis**
- Compares multiple interventions simultaneously
- Indirect comparisons
- Requires additional assumptions

---

## PHASE 1: INTRODUCTION ANALYSIS

### Research Question Requirements

**Must Be Specific and Answerable**:

```
✓ GOOD: "What is the effectiveness of cognitive behavioral therapy compared 
  to pharmacotherapy for treating major depression in adults?"

✓ GOOD: "What are the adverse effects of statins in older adults (≥65 years)?"

✗ POOR: "What is known about depression?" (Too broad - scoping review question)

✗ POOR: "Does therapy work?" (Vague - what therapy? what outcome? what population?)
```

**PICO/PECO Framework Required**:

```
P - Population: Who? (age, condition, setting)
I/E - Intervention/Exposure: What treatment/factor?
C - Comparator: Compared to what?
O - Outcome: What effect measured?

Example:
P: Adults with major depressive disorder
I: Cognitive behavioral therapy
C: Selective serotonin reuptake inhibitors
O: Depression symptom reduction (e.g., HAM-D scores)
```

### Rationale for Systematic Review

**Must Justify Why Needed**:

```
✓ "Multiple RCTs have examined this intervention, but findings are 
  inconsistent and no synthesis exists."

✓ "Previous reviews (Last et al., 2018) are now outdated. New trials 
  published 2019-2024 warrant updated synthesis."

✓ "While individual studies suggest X, quantitative synthesis is needed 
  to estimate effect size with precision."

✗ "No one has done a systematic review on this topic." (Insufficient - 
  must explain why synthesis is important)
```

---

## PHASE 2: METHODS SECTION - PRISMA 2020 COMPLIANCE

**CRITICAL**: All systematic reviews must comply with **PRISMA 2020** (27 items)

Full Checklist: https://pmc.ncbi.nlm.nih.gov/articles/PMC8007028/

### Item 1: Title

```
REQUIRED: Identify as systematic review, meta-analysis, or both

✓ "Effectiveness of CBT for Depression: A Systematic Review and Meta-Analysis"
✓ "Adverse Effects of Statins in Older Adults: A Systematic Review"

Not sufficient: "Review of CBT for Depression"
```

### Item 2: Structured Abstract

```
REQUIRED sections:
- Background/Objectives
- Methods (eligibility, sources, assessment)
- Results (studies included, synthesis)
- Conclusions
- Registration (PROSPERO number)

Word limit typically 250-300 words
```

### Item 3: Rationale

```
State why review is needed:
- Gap in evidence
- Conflicting findings
- Update of previous review
- New methodology applied
```

### Item 4: Objectives/Questions (PICO)

```
Must explicitly state PICO elements

Example:
"Objective: To evaluate the effectiveness of cognitive behavioral therapy 
compared to pharmacotherapy for reducing depressive symptoms in adults 
with major depression (PICO: P=adults with MDD, I=CBT, C=SSRIs, 
O=depression scores)."
```

### Item 5: Eligibility Criteria (CRITICAL)

```
REQUIRED - State ALL inclusion/exclusion criteria:

Study Design: "Randomized controlled trials"

Population: "Adults aged 18-65 with diagnosed major depressive disorder 
(DSM-5 or ICD-11 criteria). Excluded: bipolar disorder, psychotic features, 
substance use disorders as primary diagnosis."

Intervention: "Cognitive behavioral therapy delivered by trained therapist, 
≥8 sessions, individual or group format."

Comparator: "Selective serotonin reuptake inhibitors (any SSRI at therapeutic 
dose). Excluded: combination therapy, placebo controls."

Outcomes: "Primary: depression symptom scores (HAM-D, BDI, PHQ-9) at 
post-treatment. Secondary: remission rates, quality of life."

Timeframe: "Studies published 2000-2024. No language restrictions."

Setting: "Any setting (inpatient, outpatient, community)."
```

**Common Error**: Vague criteria ("depressed patients" vs "adults with MDD per DSM-5")

### Item 6: Information Sources

```
REQUIRED - List ALL sources searched:

Databases:
"We searched PubMed/MEDLINE, PsycINFO, Embase, Cochrane Central Register 
of Controlled Trials (CENTRAL), and Web of Science from inception to 
December 31, 2024."

Other sources:
"Reference lists of included studies and relevant reviews were hand-searched. 
We contacted corresponding authors of conference abstracts for full-text 
manuscripts. Trial registries (ClinicalTrials.gov, WHO ICTRP) were searched 
for unpublished/ongoing trials."

Dates searched:
"Final searches conducted December 15, 2024."
```

**Minimum Recommended**: 3 databases including MEDLINE

### Item 7: Search Strategy (FULL DISCLOSURE)

```
REQUIRED: Complete search strategy for ≥1 database

Must include:
- All search terms (MeSH, keywords)
- Boolean operators (AND, OR, NOT)
- Limits (date, language, publication type)
- Date of search

Example (simplified):

PubMed Search Strategy (December 15, 2024):

#1 "Cognitive Behavioral Therapy"[MeSH] OR "Cognitive Therapy"[MeSH] OR CBT[tiab] 
   OR "cognitive behavio*"[tiab]
#2 "Depression"[MeSH] OR "Depressive Disorder"[MeSH] OR depress*[tiab] OR MDD[tiab]
#3 "Selective Serotonin Reuptake Inhibitors"[MeSH] OR SSRI*[tiab] OR fluoxetine[nm] 
   OR sertraline[nm] OR paroxetine[nm] OR citalopram[nm] OR escitalopram[nm]
#4 randomized controlled trial[pt] OR randomized[tiab] OR placebo[tiab] OR 
   "clinical trial"[pt] OR randomly[tiab] OR trial[ti]
#5 #1 AND #2 AND #3 AND #4
#6 Limit #5 to (English, humans, yr="2000-2024")

Retrieved: 1,247 records
```

**Must Provide in Appendix or Supplementary File**

### Item 8: Selection Process

```
REQUIRED:
- Who screened (number of reviewers)
- How many stages (title/abstract, then full-text)
- How disagreements resolved
- Software used (if any)

Example:
"Two independent reviewers (J.S., M.K.) screened titles and abstracts using 
Covidence software. Disagreements resolved through discussion; persistent 
disagreements resolved by third reviewer (A.B.). Full texts of potentially 
eligible studies were retrieved and independently assessed by both reviewers. 
κ = 0.89 for full-text screening, indicating excellent agreement."
```

### Item 9: Data Collection Process

```
REQUIRED:
- Who extracted data
- How many extractors per study
- Pilot testing
- How disagreements resolved

Example:
"Two reviewers independently extracted data using pre-piloted forms. Pilot 
tested on 5 studies and refined. Extracted: study characteristics (author, 
year, country, setting), participant characteristics (N, age, sex, diagnosis), 
intervention details (CBT format, duration, therapist training), comparator 
details (SSRI type, dose), and outcomes (means, SDs, N per group at each 
timepoint). Disagreements resolved by consensus; unresolved by third reviewer."
```

### Item 10a: Data Items (List Everything Extracted)

```
Must specify ALL data points:

Study-level:
- Author, year, country, setting
- Study design, registration number
- Funding source

Participant-level:
- Sample size (intervention, control, total)
- Demographics (age M/SD, sex %, race/ethnicity)
- Inclusion/exclusion criteria
- Baseline severity (depression scores)

Intervention details:
- CBT format (individual/group), duration, frequency
- Therapist credentials, treatment fidelity
- Comparison intervention (SSRI type, dose, duration)

Outcomes:
- Measurement instruments used
- Timepoints measured
- Means, SDs, sample sizes per group
- Remission/response rates (n, %)
- Adverse events
```

### Item 10b: Missing Data

```
REQUIRED: How missing outcome data handled

Example:
"When means/SDs were not reported, we contacted authors (response rate: 12 
of 23, 52%). When unavailable, we calculated from other reported statistics 
(SEs, CIs, p-values, t-values) using Cochrane Handbook formulas. Studies 
with insufficient data despite author contact were excluded from meta-analysis 
but included in narrative synthesis (n=4)."
```

### Item 11: Risk of Bias Assessment (CRITICAL)

```
REQUIRED: Tool used and rationale

For RCTs: Cochrane Risk of Bias 2 (RoB 2) - 5 domains
- Randomization process
- Deviations from intended interventions
- Missing outcome data
- Measurement of outcome
- Selection of reported result

Each domain: Low / Some Concerns / High risk

Example:
"Two independent reviewers assessed risk of bias using RoB 2.0. Each domain 
rated as low risk, some concerns, or high risk. Overall bias judgment based 
on highest domain rating. Disagreements resolved through discussion. 
κ = 0.76 (substantial agreement)."

Must present results in table/figure showing risk of bias for each study
```

### Item 12: Effect Measures

```
REQUIRED: Specify outcome measure and effect size metric

Continuous outcomes:
"Depression scores analyzed as mean difference (MD) when same scale used 
(e.g., all HAM-D). Standardized mean difference (SMD) when different scales 
used (HAM-D, BDI, PHQ-9 combined)."

Binary outcomes:
"Remission rates analyzed as risk ratio (RR) with 95% CIs."

Time-to-event:
"Hazard ratios (HR) with 95% CIs."
```

### Item 13: Synthesis Methods (Meta-Analysis)

```
REQUIRED if meta-analysis conducted:

Statistical method:
"Random-effects meta-analysis using DerSimonian-Laird method. Fixed-effect 
model used if I² < 25%."

Software:
"Meta-analyses conducted in R (version 4.3.1) using 'meta' package (version 7.0)."

Handling multiple timepoints:
"When studies reported multiple timepoints, we used post-treatment (primary) 
and 6-month follow-up (secondary analyses)."

Handling multiple intervention arms:
"For studies with multiple CBT arms (e.g., individual vs group), we combined 
groups using Cochrane Handbook formulas or analyzed separately if sufficient 
studies."
```

**If NO meta-analysis**:
```
"Meta-analysis was not conducted due to heterogeneity in [interventions/
outcomes/populations]. We synthesized findings narratively using vote 
counting and effect direction plots."
```

### Item 13b: Heterogeneity Assessment

```
REQUIRED if meta-analysis:

Methods:
"Heterogeneity assessed using I² statistic and τ² (tau-squared)."

Interpretation:
"I² values interpreted as: 0-40% (might not be important), 30-60% (moderate), 
50-90% (substantial), 75-100% (considerable) per Cochrane guidelines."

Exploration:
"If I² > 50%, we conducted subgroup analyses and meta-regression to explore 
sources of heterogeneity (see Item 13d)."
```

### Item 13c: Sensitivity Analyses

```
REQUIRED: Pre-specified analyses to test robustness

Examples:
"Sensitivity analyses: (1) Excluding high risk of bias studies, (2) Excluding 
studies with imputed data, (3) Using fixed-effect model, (4) Excluding outliers 
(defined as outside 95% prediction interval)."
```

### Item 13d: Subgroup/Meta-Regression Analyses

```
Pre-specify subgroups:

"Pre-specified subgroup analyses:
- CBT format (individual vs group)
- Baseline severity (mild-moderate vs severe)
- Treatment duration (<12 vs ≥12 sessions)
- Publication year (pre-2010 vs 2010+)
- Risk of bias (low vs some concerns/high)"

Report interaction tests:
"Subgroup differences tested using Chi² test (p < .10 considered significant 
due to low power)."
```

### Item 13e: Publication Bias Assessment

```
REQUIRED if ≥10 studies in meta-analysis:

Visual:
"Publication bias assessed using funnel plot visual inspection."

Statistical:
"Egger's regression test for small-study effects (p = .042 indicating 
potential bias). Trim-and-fill method applied to estimate number of missing 
studies and adjust pooled estimate."

If <10 studies:
"Publication bias assessment not conducted due to insufficient power (n=7 
studies)."
```

### Item 14: Certainty of Evidence (GRADE)

```
REQUIRED: GRADE assessment for each outcome

Five domains:
1. Risk of bias
2. Inconsistency (heterogeneity)
3. Indirectness (generalizability)
4. Imprecision (wide CIs, small N)
5. Publication bias

Rating: High / Moderate / Low / Very Low

Example:
"GRADE assessment for depression reduction outcome: Started at HIGH (RCTs). 
Downgraded one level for risk of bias (3 studies high risk). Downgraded 
one level for inconsistency (I² = 68%). Final rating: MODERATE certainty."

Present in Summary of Findings table
```

### Item 15-16: Study Selection (Results)

```
Required: PRISMA 2020 Flow Diagram

Must show:
- Records identified from databases (per database)
- Records identified from other sources
- Duplicate records removed
- Records screened (title/abstract)
- Records excluded with reasons
- Reports sought for retrieval
- Reports not retrieved
- Reports assessed for eligibility (full-text)
- Reports excluded with reasons (categorized)
- Studies included in review
- Studies included in meta-analysis

Template: https://www.prisma-statement.org/prisma-2020-flow-diagram
```

### Item 17: Study Characteristics Table

```
Required: Table summarizing each included study

Columns typically include:
- Study (Author, Year, Country)
- Design & Registration
- Sample (N, Age, Sex, Setting)
- Intervention (CBT details)
- Comparator (SSRI details)
- Outcomes (Instruments, Timepoints)
- Key Findings

Can be supplementary if many studies
```

### Item 18: Risk of Bias Results

```
Required: Risk of bias summary

Present as:
- Traffic light plot (red/yellow/green per domain per study)
- Summary table (% studies low/some concerns/high per domain)
- Narrative description of patterns

Example:
"Of 23 included RCTs, 8 (35%) had overall low risk of bias, 10 (43%) had 
some concerns, and 5 (22%) had high risk. Primary concerns were in 
randomization process (7 studies unclear allocation concealment) and missing 
outcome data (6 studies >20% attrition without ITT analysis)."
```

### Item 19: Results of Individual Studies

```
Forest plot required if meta-analysis

Each study shown with:
- Effect size (mean difference or SMD)
- 95% CI
- Weight (% contribution to pooled estimate)
- Individual study results (boxes)
- Pooled estimate (diamond)
```

### Item 20: Synthesis Results

```
Meta-analysis:
"Pooled SMD = -0.52, 95% CI [-0.71, -0.33], p < .001, favoring CBT. This 
represents a moderate effect. I² = 68% (substantial heterogeneity). 
τ² = 0.14. Prediction interval: [-1.05, 0.01], indicating considerable 
variability in individual study effects."

Narrative synthesis:
"Of 15 studies, 12 (80%) found significant benefit of CBT, 2 (13%) found 
no difference, and 1 (7%) favored pharmacotherapy. Effect direction plot 
presented in Figure 3."
```

### Item 20b: Heterogeneity Results

```
"Substantial heterogeneity observed (I² = 68%). Subgroup analysis by CBT 
format revealed individual CBT (SMD = -0.67, I² = 42%) showed larger effects 
than group CBT (SMD = -0.38, I² = 51%), though interaction test was not 
significant (p = .12). Meta-regression found treatment duration significantly 
moderated effects (b = -0.05 per session, p = .03)."
```

### Item 20c: Sensitivity Analysis Results

```
"Sensitivity analyses:
- Excluding high risk of bias studies (n=5): SMD = -0.58, 95% CI [-0.79, -0.37]
- Fixed-effect model: SMD = -0.49, 95% CI [-0.58, -0.40]
- Excluding imputed data (n=4): SMD = -0.54, 95% CI [-0.76, -0.32]
All sensitivity analyses confirmed robustness of primary finding."
```

### Item 20d: Publication Bias Results

```
"Funnel plot showed asymmetry (Figure 4). Egger's test significant (p = .042). 
Trim-and-fill method estimated 5 missing studies on left side of funnel. 
Adjusted pooled estimate: SMD = -0.44, 95% CI [-0.65, -0.23], still 
statistically significant but attenuated."
```

### Item 21: Certainty of Evidence

```
Summary of Findings Table:

| Outcome | Studies (N) | Pooled Effect (95% CI) | Certainty | Reason for Downgrade |
|---------|-------------|------------------------|-----------|---------------------|
| Depression post-tx | 23 (2,450) | SMD -0.52 [-0.71,-0.33] | ⊕⊕⊕○ MODERATE | Risk of bias (-1), Inconsistency (-1) |
| Remission rate | 18 (1,890) | RR 1.45 [1.21, 1.74] | ⊕⊕○○ LOW | Risk of bias (-1), Publication bias (-1) |

⊕⊕⊕⊕ = High, ⊕⊕⊕○ = Moderate, ⊕⊕○○ = Low, ⊕○○○ = Very low
```

---

## PHASE 3: REGISTRATION REQUIREMENT

### PROSPERO Registration (MANDATORY)

**When**: BEFORE screening begins (ideally before searches)

**What to Register**:
- Review question (PICO)
- Eligibility criteria
- Information sources
- Outcomes
- Risk of bias assessment method
- Synthesis method

**Where**: PROSPERO (https://www.crd.york.ac.uk/prospero/)

**Reporting**:
```
"This systematic review was registered with PROSPERO (CRD42024123456) on 
October 1, 2024, before screening commenced."

If protocol published:
"The review protocol was published (Smith et al., 2024, DOI: 10.xxxx/yyyy)."
```

**Deviations from Protocol**:
```
Must report ANY changes from registered protocol

"Deviations from protocol: We added Embase to databases searched (not 
originally planned) to increase comprehensiveness. We added subgroup 
analysis by baseline severity (post-hoc) due to observed heterogeneity."
```

---

## PHASE 4: STATISTICAL METHODS

### Effect Size Calculation

**Mean Difference (MD)** - Same scale:
```
MD = Mean_intervention - Mean_control

SE = √[(SD₁²/n₁) + (SD₂²/n₂)]

Used when all studies measure outcome on same scale (e.g., all HAM-D)
```

**Standardized Mean Difference (SMD)** - Different scales:
```
SMD = (Mean_intervention - Mean_control) / SD_pooled

Hedges' g adjustment for small samples

Used when studies use different scales (HAM-D, BDI, PHQ-9)

Interpretation:
- Small: 0.2
- Medium: 0.5
- Large: 0.8
```

**Risk Ratio (RR)** - Binary outcomes:
```
RR = (events_intervention / N_intervention) / (events_control / N_control)

RR > 1: Intervention increases outcome
RR < 1: Intervention decreases outcome

For beneficial outcomes (e.g., remission): RR > 1 favors intervention
For harmful outcomes (e.g., adverse events): RR < 1 favors intervention
```

### Pooling Methods

**Fixed-Effect Model**:
```
Assumes one true effect size
All variability due to sampling error
Only use if I² < 25% AND strong rationale
```

**Random-Effects Model** (Recommended):
```
Assumes distribution of true effects
Accounts for between-study variability
Use when I² > 25% OR when studies differ in design/population
Gives more weight to smaller studies than fixed-effect
```

### Heterogeneity Measures

**I² Statistic**:
```
% of variability due to true differences vs sampling error

0-40%: Might not be important
30-60%: Moderate
50-90%: Substantial  
75-100%: Considerable

Calculate: I² = [(Q - df) / Q] × 100%
```

**Tau² (τ²)**:
```
Estimate of between-study variance
In same units as effect size
Used in random-effects weighting
```

**Prediction Interval**:
```
Range where 95% of true effects expected to fall
Wider than confidence interval
Clinically informative about expected effect in new study

Example:
"Pooled SMD = -0.52, 95% CI [-0.71, -0.33], 95% PI [-1.05, 0.01]"
This means: while average effect is -0.52, in a new study we'd expect 
effects ranging from -1.05 to 0.01 (crosses null - some studies may find 
no effect)
```

---

## PHASE 5: NARRATIVE SYNTHESIS (When Meta-Analysis Not Possible)

### When to Use Narrative Synthesis:

- Too few studies (typically <3)
- Excessive heterogeneity that can't be explained
- Outcomes measured too differently
- Data unavailable despite author contact

### Synthesis Approaches:

**Vote Counting** (Least Preferred):
```
"Of 8 studies, 6 found significant benefit of intervention, 2 found no 
difference. No studies favored control."

Problems: Ignores sample size, effect magnitude, precision
Only use when no alternative
```

**Effect Direction Plot**:
```
Visual showing direction and significance of each study
Better than vote counting
Shows pattern of evidence
```

**Harvest Plot**:
```
Bar height = study quality
Bar position = effect direction
Bar width = sample size
```

**Textual Description**:
```
Organize by outcome, design, population
Synthesize patterns
Acknowledge contradictions

Example:
"Six of eight studies found CBT superior to SSRI for reducing depression 
(effect sizes ranged from SMD -0.3 to -0.8). Two studies found no difference; 
both had small samples (n<50) and high attrition (>30%). Studies with 
individual CBT consistently showed larger effects than group CBT."
```

---

## COMMON ERRORS IN SYSTEMATIC REVIEWS

### Error 1: Search Not Comprehensive

```
❌ Only PubMed searched
❌ Only English-language studies
❌ No grey literature search

✓ Minimum 3 databases
✓ No language restrictions OR acknowledge as limitation
✓ Hand-search references, contact authors, search trial registries
```

### Error 2: No Protocol/Registration

```
❌ No PROSPERO registration
❌ Registered after screening started (retrospective)

✓ Register before screening
✓ Report deviations if any
```

### Error 3: Single Reviewer Screening

```
❌ One person screened and extracted data

✓ Two independent reviewers for screening
✓ Two independent reviewers for data extraction
✓ Measure and report agreement (κ)
```

### Error 4: No Risk of Bias Assessment

```
❌ Quality not assessed
❌ Generic quality scores (Jadad scale - now discouraged)

✓ Use RoB 2 for RCTs
✓ Use ROBINS-I for non-randomized studies
✓ Present results graphically and narratively
```

### Error 5: Inappropriate Pooling

```
❌ Meta-analysis of very heterogeneous studies (I² > 90%)
❌ Combining RCTs with observational studies
❌ Pooling despite different interventions/outcomes

✓ Only pool when clinically and methodologically appropriate
✓ Use random-effects model for heterogeneity
✓ Explore heterogeneity via subgroup analysis
✓ Use narrative synthesis if pooling inappropriate
```

### Error 6: No GRADE Assessment

```
❌ No certainty of evidence rating

✓ Apply GRADE to each outcome
✓ Create Summary of Findings table
✓ Justify downgrades transparently
```

### Error 7: Cherry-Picking Results

```
❌ Only reporting outcomes that favor hypothesis
❌ Excluding studies with null findings

✓ Report ALL pre-specified outcomes
✓ Include all eligible studies regardless of results
✓ Acknowledge publication bias
```

---

## FIELD-SPECIFIC VARIATIONS

### Cochrane Reviews

**Gold Standard** - Most rigorous

Additional requirements:
- Cochrane Handbook followed precisely
- RevMan software often required
- Living systematic review updates
- Plain language summary required

### Campbell Collaboration (Social Sciences)

Similar to Cochrane but for:
- Education
- Criminal justice
- Social welfare
- International development

### JBI Systematic Reviews (Nursing/Allied Health)

Uses different tools:
- JBI critical appraisal tools
- Narrative, umbrella, scoping review methods

---

## SCOPING REVIEWS (PRISMA-ScR)

### When to Conduct Scoping Review Instead:

- Mapping breadth of literature
- Identifying research gaps
- Question too broad for systematic review
- Heterogeneous evidence
- Emerging topic with varied methodologies

### Key Differences from Systematic Review:

**Scoping Review**:
- Broader question
- No quality appraisal typically
- No meta-analysis
- Maps what's known
- PRISMA-ScR (22 items)

**Systematic Review**:
- Specific PICO question
- Quality appraisal mandatory
- May include meta-analysis
- Answers specific question
- PRISMA 2020 (27 items)

---

## RESOURCES FOR SYSTEMATIC REVIEWS

### Core Standards
- PRISMA 2020 Statement: https://pmc.ncbi.nlm.nih.gov/articles/PMC8007028/
- PRISMA Flow Diagram: https://www.prisma-statement.org/prisma-2020-flow-diagram
- PRISMA-ScR (Scoping): https://www.equator-network.org/reporting-guidelines/prisma-scr/

### Registration
- PROSPERO: https://www.crd.york.ac.uk/prospero/

### Methodological Guidance
- Cochrane Handbook: https://training.cochrane.org/handbook
- GRADE Working Group: https://www.gradeworkinggroup.org/

### Risk of Bias Tools
- RoB 2 (RCTs): https://www.riskofbias.info/welcome/rob-2-0-tool
- ROBINS-I (Non-randomized): https://www.riskofbias.info/welcome/robins-i-tool

### Software
- RevMan (Cochrane): https://training.cochrane.org/online-learning/core-software/revman
- R 'meta' package: https://CRAN.R-project.org/package=meta
- Covidence (screening): https://www.covidence.org/

---

**END OF MODULE 04: SYSTEMATIC REVIEWS**

*This module covers systematic reviews and meta-analyses. For primary research studies, use appropriate modules (01-03, 05).*

**Version**: 3.0
**Last Updated**: February 2026
**Maintained By**: SAGE Development Team
