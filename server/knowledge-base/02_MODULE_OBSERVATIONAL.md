# SAGE MODULE: OBSERVATIONAL/CORRELATIONAL
**Module 02 - Cohort, Case-Control, Cross-Sectional, Survey Studies**
**Version 3.0**
**Last Updated: February 2026**

---

## MODULE SCOPE

This module applies to:
- **Cohort Studies** - Follow groups over time, measure exposures and outcomes
- **Case-Control Studies** - Compare cases (with outcome) to controls (without outcome), look back at exposures
- **Cross-Sectional Studies** - Measure exposures and outcomes at single timepoint
- **Survey Research** - Questionnaire-based studies without manipulation
- **Correlational Studies** - Examine relationships between naturally-occurring variables

**Key Characteristic**: Researcher **observes** naturally-occurring variables without manipulation. No random assignment to conditions.

---

## DOCUMENT CLASSIFICATION

### Auto-Detection Keywords:
```
Primary Triggers (High Confidence):
- "cohort study", "prospective cohort", "retrospective cohort"
- "case-control study", "case-control design"
- "cross-sectional study", "cross-sectional survey"
- "observational study", "observational design"
- "correlational study", "correlation analysis"
- "STROBE", "epidemiological"
- "survey", "questionnaire study"
- "prevalence", "incidence"

Secondary Triggers (Medium Confidence):
- "association", "relationship between"
- "predictor", "predicted"
- "regression analysis" (without experimental manipulation)
- "longitudinal" (if no intervention)
- "naturalistic observation"
```

### Sub-Types Within This Module:

**1. Cohort Study**
- **Prospective**: Identify exposure → follow forward in time → measure outcome
- **Retrospective**: Use existing records to identify exposure and outcome
- Temporality established (exposure before outcome)
- Can calculate incidence, relative risk

**2. Case-Control Study**
- Select cases (with disease/outcome) and controls (without)
- Look backward at exposures
- Efficient for rare outcomes
- Can calculate odds ratios (NOT relative risk)

**3. Cross-Sectional Study**
- Single measurement timepoint
- Exposure and outcome measured simultaneously
- CANNOT establish temporal precedence
- Can calculate prevalence (not incidence)
- Most common in social sciences

**4. Survey Research**
- Questionnaire-based data collection
- May be cross-sectional or longitudinal
- Sampling strategy critical

---

## PHASE 1: INTRODUCTION ANALYSIS

### Research Question Requirements

**Must Frame as Association/Relationship, NOT Causation**:

```
✓ GOOD: "Is smoking associated with lung cancer risk in adults?"
✓ GOOD: "What factors predict academic achievement in college students?"
✓ GOOD: "Does social media use correlate with depression symptoms?"

✗ POOR: "Does smoking cause lung cancer?"
  (Causal language inappropriate for observational design)

✗ POOR: "What is the effect of social media on depression?"
  (Implies manipulation - use "association" or "relationship")
```

**Components of Strong Observational RQ**:
1. **Population**: Clearly defined
2. **Exposure/Predictor**: Measured variable (not manipulated)
3. **Outcome**: What is being predicted/explained
4. **Temporal Relationship**: Stated if known (cohort) or acknowledged as unknown (cross-sectional)

### Hypothesis Formulation

**MUST Use Correlational Language**:

```
✓ "We hypothesized that higher social media use would be associated with 
  higher depression scores."

✓ "We predicted that smoking status would correlate with lung cancer 
  incidence."

✗ "We hypothesized that social media use would increase depression."
  (Causal language - forbidden)

✗ "We expected smoking to cause lung cancer."
  (Causal language - forbidden)
```

### Gap Statement for Observational Studies

**Justify Why Observation Is Appropriate**:

```
✓ "While experimental studies cannot ethically manipulate smoking exposure, 
  observational designs allow examination of naturally-occurring smoking 
  behaviors and health outcomes."

✓ "No experimental study has examined this relationship due to ethical 
  constraints. Observational data provide important preliminary evidence."

✓ "Previous cross-sectional studies found correlations, but no cohort study 
  has established temporal precedence."
```

---

## PHASE 2: METHODS SECTION - STROBE COMPLIANCE

**CRITICAL**: All observational studies must comply with **STROBE** (22 items)

**Strengthening the Reporting of Observational Studies in Epidemiology**

Full Checklist: https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0040297

### STROBE Key Items to Verify:

#### Item 1: Title and Abstract

```
REQUIRED: Indicate study design in title or abstract

✓ "A Cross-Sectional Study of Social Media Use and Depression"
✓ "Prospective Cohort Study of Smoking and Lung Cancer Risk"

Abstract must include: design, setting, participants, variables, results, conclusions
```

#### Item 5: Objectives

```
REQUIRED: State specific objectives or hypotheses

Example:
"The primary objective was to examine the association between daily social 
media use (hours/day) and depressive symptoms (measured by PHQ-9) in college 
students, controlling for demographic and psychosocial confounds."
```

#### Item 6: Study Design (Critical - Design-Specific)

**Cohort Studies**:
```
REQUIRED:
- Cohort identified based on exposure status or as general population
- Follow-up period clearly stated
- Prospective vs retrospective specified

Example:
"This prospective cohort study followed 2,450 adults aged 40-65 without 
lung cancer at baseline. Smoking status was assessed at enrollment (2020), 
and participants were followed for cancer diagnosis through December 2024 
(median follow-up: 4.2 years)."
```

**Case-Control Studies**:
```
REQUIRED:
- How cases and controls selected
- Matching strategy (if used)
- Number of controls per case

Example:
"Cases were patients diagnosed with lung cancer at City Hospital 2020-2024 
(n = 300). Controls were age- and sex-matched patients without cancer from 
the same hospital (n = 600, 2:1 ratio)."
```

**Cross-Sectional Studies**:
```
REQUIRED:
- Single timepoint clearly stated
- Sampling frame described

Example:
"This cross-sectional survey was conducted in March 2024 among undergraduate 
students at State University. All enrolled students (N = 15,000) received 
email invitations; 3,847 completed the survey (26% response rate)."
```

#### Item 7: Setting

```
REQUIRED:
- Locations and relevant dates
- Recruitment periods
- Follow-up periods (cohort)

Example:
"Data were collected from five urban primary care clinics in California 
between January 2022 and June 2023. Follow-up continued through December 2024."
```

#### Item 8: Participants

```
REQUIRED:
- Eligibility criteria with rationale
- Sources and methods of selection

Example:
"Inclusion criteria: Adults aged 18-65, fluent in English, no previous 
cancer diagnosis. Exclusion criteria: Cognitive impairment preventing 
informed consent, current chemotherapy. Participants were recruited via 
clinic waiting rooms using systematic sampling (every 5th patient)."
```

#### Item 9: Variables

```
REQUIRED:
- Clearly define all outcomes, exposures, predictors, confounders
- State how each was measured

Example:
"Primary outcome: Depressive symptoms measured using Patient Health 
Questionnaire-9 (PHQ-9; score 0-27, validated in college populations, 
α = .89 in this sample).

Primary exposure: Daily social media use measured via self-report question: 
'On average, how many hours per day do you use social media (Facebook, 
Instagram, TikTok, Twitter)?' Response options: <1, 1-2, 3-4, 5-6, >6 hours.

Covariates: Age, sex, academic year, living situation, prior mental health 
diagnosis (self-report), social support (Multidimensional Scale of Perceived 
Social Support, α = .91)."
```

#### Item 10: Data Sources/Measurement

```
REQUIRED:
- For each variable, give sources and details of measurement methods
- State reliability/validity if instruments used

Example:
"Social support was measured using the 12-item Multidimensional Scale of 
Perceived Social Support (Zimet et al., 1988), which has demonstrated good 
reliability (α = .88) and validity in college samples. Internal consistency 
in this sample was α = .91."
```

#### Item 11: Bias

```
REQUIRED: Describe efforts to address potential sources of bias

Example:
"To minimize selection bias, we used stratified random sampling across 
academic years and colleges. To reduce recall bias in self-reported social 
media use, we asked participants to check their phone's screen time data 
before responding. To address social desirability bias, surveys were 
anonymous and completed online without researcher presence."
```

#### Item 12: Study Size

```
REQUIRED: Explain how study size was arrived at

Example:
"Sample size was determined using G*Power for multiple regression with 8 
predictors: to detect R² = .10 (small-medium effect) with 80% power at 
α = .05 required n = 160. To account for 20% incomplete surveys, we aimed 
for n = 200."
```

#### Item 13: Quantitative Variables

```
REQUIRED: Explain how quantitative variables were handled in analyses

Example:
"Social media use was treated as ordinal (5 categories) in initial analyses 
and as continuous (midpoint of each category) for regression. Age was mean-
centered. PHQ-9 was treated as continuous (validated as such)."
```

#### Item 14: Statistical Methods (Design-Specific)

**Cohort Studies**:
```
REQUIRED:
- How person-time was calculated
- Incidence rates and relative risks
- Adjustment for confounders (multivariable models)

Example:
"Incidence rates per 1,000 person-years were calculated. Cox proportional 
hazards models estimated hazard ratios for lung cancer by smoking status, 
adjusting for age, sex, occupational exposures, and family history."
```

**Case-Control Studies**:
```
REQUIRED:
- How matching was handled in analysis (conditional logistic regression)
- Odds ratios with 95% CIs
- Adjustment for confounders

Example:
"Conditional logistic regression accounting for age-sex matching yielded 
adjusted odds ratios (aOR) for lung cancer by smoking status, controlling 
for occupational exposures and family history."
```

**Cross-Sectional Studies**:
```
REQUIRED:
- Correlation or regression models
- Adjustment for confounders
- How directionality is (or isn't) inferred

Example:
"Hierarchical multiple regression examined associations between social media 
use and depression. Model 1: demographics. Model 2: added social support. 
Model 3: added social media use. We cannot infer directionality from this 
cross-sectional design."
```

#### Item 15: Sensitivity Analyses

```
REQUIRED: Describe any sensitivity analyses

Example:
"Sensitivity analysis excluding participants with prior depression diagnosis 
(n = 47) yielded similar results. Propensity score matching (social media 
users vs non-users) on demographics produced comparable effect estimates."
```

#### Item 16: Results - Participant Flow

**Cohort**:
```
Report numbers at each stage:
- Assessed for eligibility
- Enrolled
- Lost to follow-up (with reasons)
- Analyzed

Include flowchart if attrition >10%
```

**Cross-Sectional**:
```
Report:
- Sampling frame size
- Response rate
- Excluded (with reasons)
- Analyzed
```

#### Item 17: Descriptive Data

```
REQUIRED:
- Characteristics of participants
- Number of participants with missing data per variable
- Cohort: summary of follow-up time

Example Table:
"Mean follow-up: 4.2 years (SD = 1.1). Total person-years: 10,290."
```

#### Item 18: Outcome Data

**Cohort**:
```
Report number of outcome events
Report incidence rates per person-time
```

**Case-Control**:
```
Report number of cases and controls
Report exposure prevalence in each group
```

**Cross-Sectional**:
```
Report outcome prevalence
Report exposure prevalence
```

#### Item 19: Main Results

```
REQUIRED:
- Unadjusted estimates with CIs
- Adjusted estimates with CIs
- List all covariates adjusted for

Example:
"In unadjusted analysis, heavy social media use (>6 hours/day) was associated 
with higher PHQ-9 scores, b = 3.45, 95% CI [2.10, 4.80], p < .001. After 
adjusting for age, sex, social support, and prior diagnosis, the association 
remained significant but attenuated: b = 2.12, 95% CI [0.89, 3.35], p = .001."
```

#### Item 20: Other Analyses

```
Report subgroup analyses, interaction tests, sensitivity analyses
```

#### Item 21: Key Results Summary

```
Summarize with reference to study objectives
```

#### Item 22: Limitations

```
REQUIRED: Discuss:
- Sources of bias
- Imprecision (CIs, sample size)
- Generalizability

Most Important for Observational Studies:
"As this is a cross-sectional design, we cannot establish temporal precedence. 
Depression may lead to increased social media use, social media use may 
contribute to depression, or a third variable may cause both. Longitudinal 
research is needed to disentangle directionality."
```

---

## PHASE 3: CRITICAL REQUIREMENT - NO CAUSAL LANGUAGE

### **FORBIDDEN: Causal Verbs**

**These verbs are PROHIBITED in observational studies**:

❌ cause, causes, caused  
❌ increase, increases, increased (when referring to effects)  
❌ decrease, decreases, decreased (when referring to effects)  
❌ produce, produces, produced  
❌ lead to, leads to, led to  
❌ result in, results in, resulted in  
❌ reduce, reduces, reduced (effects)  
❌ improve, improves, improved (effects)  
❌ prevent, prevents, prevented  
❌ enhance, enhances, enhanced (effects)  
❌ promote, promotes, promoted (effects)  

### **REQUIRED: Associational Language**

**Use these alternatives**:

✓ is associated with, was associated with  
✓ correlates with, correlated with  
✓ predicts, predicted  
✓ is related to, was related to  
✓ co-occurs with  
✓ accompanies, accompanied  
✓ corresponds with  

### **Hedging Hierarchy (Weakest to Strongest)**

```
VERY WEAK (use for exploratory findings):
- "may be associated with"
- "might predict"
- "appears to correlate with"
- "could be related to"

WEAK (use for cross-sectional):
- "suggests an association"
- "is consistent with"
- "indicates a relationship"

MODERATE (use for cohort with temporal precedence):
- "predicts"
- "is associated with"
- "correlates with"

Never use STRONG language (demonstrates, establishes, shows causation) 
in observational studies
```

### Examples: Wrong vs Right

**Cross-Sectional Survey**:
```
❌ "Social media use causes depression in college students."
❌ "High social media use increases depression risk."
❌ "Reducing social media would improve mental health."

✓ "Social media use was associated with higher depression scores."
✓ "Students reporting high social media use also reported higher depression."
✓ "These findings suggest a relationship between social media use and 
  depression, although directionality cannot be determined from this 
  cross-sectional design."
```

**Cohort Study** (temporal precedence established):
```
❌ "Smoking causes lung cancer."
❌ "Smoking increases lung cancer risk."

✓ "Smoking predicted lung cancer incidence over 10-year follow-up."
✓ "Smokers had 15.8 times higher risk of lung cancer compared to non-smokers 
  (HR = 15.8, 95% CI [10.2, 24.5])."
✓ "These findings are consistent with a causal relationship, although residual 
  confounding cannot be ruled out."
```

**Case-Control Study**:
```
❌ "Pesticide exposure caused Parkinson's disease."

✓ "Pesticide exposure was more common among cases than controls (OR = 3.4, 
  95% CI [1.8, 6.2]), suggesting an association between exposure and disease."
✓ "After controlling for age, sex, and genetic factors, pesticide exposure 
  remained associated with Parkinson's disease."
```

### When Causal Language Detection Triggers:

**IF manuscript contains causal verbs in Results or Discussion sections**:

```
🔴 CRITICAL ERROR: Causal Language in Observational Study

WHY IT MATTERS: Observational designs cannot establish causation due to 
potential confounding, reverse causation, and lack of experimental control. 
Research shows 34% of observational studies inappropriately use causal 
language, misleading readers and reviewers.

CURRENT STATE: Your Discussion states "social media use causes depression" 
(paragraph 3, line 142).

RECOMMENDATION: Replace all causal language with associational terms:
- "causes" → "is associated with" or "predicts"
- "increases" → "is related to higher levels of"
- "reduces" → "is associated with lower levels of"

STANDARD: APA 7th Edition; "Being Honest with Causal Language" (Wiley, 2021)

LEARN MORE: https://onlinelibrary.wiley.com/doi/10.1111/jan.14311
```

---

## PHASE 4: CONFOUND ANALYSIS (CRITICAL)

### What is a Confound?

**A variable that**:
1. Is associated with the exposure/predictor
2. Is associated with the outcome
3. Is NOT on the causal pathway (not a mediator)

**Example**: 
```
Exposure: Coffee consumption
Outcome: Lung cancer
Confound: Smoking

Smokers drink more coffee AND smoking causes lung cancer.
Coffee appears to predict cancer, but the relationship is spurious 
(due to smoking).
```

### Required Confound Discussion

**In Methods - Must State**:
```
"We controlled for the following potential confounds based on prior literature 
and theoretical rationale:
- Age (older adults have higher cancer risk)
- Sex (cancer incidence differs by sex)
- Occupational exposures (asbestos, chemicals)
- Family history (genetic predisposition)
- Socioeconomic status (access to healthcare)"
```

**In Results - Must Report**:
```
"In unadjusted analysis: [exposure-outcome association]
After adjusting for [list confounds]: [adjusted association]"

Both unadjusted AND adjusted estimates required
```

**In Discussion - Must Acknowledge**:
```
"Although we controlled for [list], residual confounding may remain. 
Unmeasured variables such as [examples] could influence results. 
Experimental studies are needed to establish causation."
```

### Statistical Approaches to Confounding

**Multivariable Regression**:
```
Example:
"Hierarchical multiple regression:
Model 1 (unadjusted): Social media use predicted PHQ-9, β = .34, p < .001, 
R² = .12
Model 2 (+demographics): β = .31, p < .001, ΔR² = .08
Model 3 (+social support): β = .18, p = .003, ΔR² = .15

Interpretation: After controlling for demographics and social support, the 
association between social media use and depression weakened but remained 
significant, suggesting partial confounding by social support."
```

**Stratification**:
```
Examine exposure-outcome relationship within levels of confound

Example:
"Among men: OR = 2.3, 95% CI [1.5, 3.6]
Among women: OR = 2.1, 95% CI [1.4, 3.2]
Sex did not significantly modify the association (interaction p = .712)"
```

**Propensity Score Methods**:
```
Use when many confounds and limited sample size

Example:
"Propensity scores for social media use (high vs low) were calculated using 
logistic regression (covariates: age, sex, SES, social support). Inverse 
probability of treatment weighting (IPTW) balanced groups on all covariates 
(standardized differences <0.1). IPTW-adjusted analysis: β = 1.87, 95% CI 
[0.65, 3.09]."
```

**Instrumental Variable Analysis** (advanced):
```
Use variable that affects exposure but NOT outcome (except through exposure)

Rarely feasible in practice - requires strong assumptions
```

### Residual Confounding

**ALWAYS Acknowledge**:
```
"Despite controlling for measured confounds, residual confounding by 
unmeasured variables (e.g., genetic factors, early life experiences, 
personality traits) cannot be ruled out. These findings should be 
interpreted as associations, not causal effects."
```

---

## PHASE 5: DESIGN-SPECIFIC ANALYSIS REQUIREMENTS

### Cohort Studies

**Strengths**:
- Temporal precedence (exposure measured before outcome)
- Can calculate incidence and relative risk
- Multiple outcomes can be examined

**Analysis Requirements**:

**Incidence Rate**:
```
Formula: (Number of new cases) / (Person-time at risk)

Example:
"Over 10,290 person-years of follow-up, 47 lung cancer cases occurred among 
smokers (incidence rate: 15.2 per 1,000 person-years) and 8 among non-smokers 
(2.1 per 1,000 person-years)."
```

**Relative Risk (RR)**:
```
RR = (Incidence in exposed) / (Incidence in unexposed)

Example:
"Smokers had 7.2 times higher lung cancer risk than non-smokers (RR = 7.2, 
95% CI [3.4, 15.3])."
```

**Hazard Ratio (HR)** - Cox Proportional Hazards:
```
Accounts for time-to-event and censoring

Example:
"Cox regression adjusting for age, sex, and occupational exposures: HR = 6.8, 
95% CI [3.1, 14.9], p < .001."

Check proportional hazards assumption (log-log survival curves should be parallel)
```

**Attrition Analysis** (CRITICAL):
```
Compare those who completed follow-up vs those lost

Example:
"Participants lost to follow-up (n = 127, 12%) were younger (M = 42.3 vs 
48.7 years, p < .001) and more likely to be current smokers (58% vs 43%, 
p = .003). This differential attrition may bias results toward the null."
```

### Case-Control Studies

**Strengths**:
- Efficient for rare outcomes
- Multiple exposures can be examined
- Faster than cohort (no waiting for outcomes)

**Limitations**:
- Cannot calculate incidence or relative risk
- Subject to recall bias
- Selecting appropriate controls is challenging

**Analysis Requirements**:

**Odds Ratio (OR)**:
```
ONLY measure available from case-control design

Formula: (Odds of exposure in cases) / (Odds of exposure in controls)

Example:
"Cases were more likely to report pesticide exposure (73%) than controls 
(42%), OR = 3.7, 95% CI [2.1, 6.5]."
```

**Adjusted OR** - Logistic Regression:
```
Control for confounds

Example:
"After adjusting for age, sex, and rural residence, the association between 
pesticide exposure and Parkinson's disease remained: aOR = 3.2, 95% CI 
[1.7, 6.0]."
```

**Matched Analysis**:
```
If cases and controls were matched, analysis MUST account for matching

Use conditional logistic regression (NOT standard logistic regression)

Example:
"Conditional logistic regression accounting for age-sex matching: OR = 4.1, 
95% CI [2.0, 8.4]."
```

**Recall Bias Mitigation**:
```
Cases may remember exposures more accurately than controls

Strategies:
- Validate self-report against records when possible
- Blind interviewers to case/control status
- Use structured questionnaires (not open-ended)
- Acknowledge in limitations

Example:
"Cases may recall exposures more accurately due to searching for explanations 
for their disease (recall bias). To minimize this, we used structured 
questionnaires and blinded interviewers to case/control status. However, 
differential recall cannot be ruled out."
```

### Cross-Sectional Studies

**Strengths**:
- Fast and inexpensive
- Good for prevalence estimates
- Can examine multiple exposures and outcomes

**Limitations**:
- **Cannot establish temporal precedence** (CRITICAL)
- Cannot calculate incidence
- Susceptible to selection bias

**Analysis Requirements**:

**Prevalence**:
```
Formula: (Number with outcome) / (Total sample size)

Example:
"Depression prevalence: 23.4% (95% CI [21.1%, 25.9%])"
```

**Correlation Analysis**:
```
Pearson r for continuous variables
Spearman ρ for ordinal or non-normal

Example:
"Social media use correlated positively with depression scores, r = .34, 
95% CI [.26, .41], p < .001."
```

**Regression Analysis**:
```
Linear regression (continuous outcome)
Logistic regression (binary outcome)

Example:
"Multiple regression: Social media use predicted PHQ-9 scores, controlling 
for demographics and social support, β = .18, 95% CI [.06, .30], p = .003, 
R² = .21."
```

**Temporal Precedence Problem** (MUST ACKNOWLEDGE):
```
🟡 IMPORTANT: Cross-Sectional Directionality Unknown

WHY IT MATTERS: Because exposure and outcome were measured simultaneously, 
we cannot determine which came first. Depression may lead to increased social 
media use, social media use may contribute to depression, or both may be 
caused by a third variable.

CURRENT STATE: Your Discussion interprets findings as if social media use 
causes depression, but your design is cross-sectional.

RECOMMENDATION: Add to limitations: "The cross-sectional design precludes 
inferences about temporal precedence or causality. Longitudinal research is 
needed to determine directionality."

STANDARD: STROBE Statement, Item 22 (Limitations)
```

### Survey Research Specific Issues

**Response Rate**:
```
Calculate and report:
Response Rate = (Completed surveys) / (Total invited)

Example:
"Of 5,000 invited students, 1,247 completed surveys (25% response rate)."

Low response rates (<40%) raise selection bias concerns
```

**Non-Response Bias Analysis**:
```
Compare respondents to population on available demographics

Example:
"Respondents were more likely to be female (64% vs 52% in student population, 
p < .001) and upper-class students (juniors/seniors: 61% vs 50%, p = .02). 
Results may not generalize to male or younger students."
```

**Sampling Weights** (if used):
```
Post-stratification weights to match population

Example:
"Data were weighted to match university demographics on sex, race/ethnicity, 
and academic year. Weighted analyses yielded similar results to unweighted."
```

---

## PHASE 6: EFFECT SIZE INTERPRETATION

### Correlation Coefficients (r, ρ)

**Cohen's Benchmarks**:
```
Small: r = .10
Medium: r = .30
Large: r = .50
```

**But context matters**:
```
In personality research: r = .20 is typical
In physics: r = .95 is expected
In education interventions: r = .30 is substantial

Always cite field-specific norms when interpreting
```

**Report**:
```
"Social media use correlated moderately with depression, r = .34, 95% CI 
[.26, .41], p < .001. This magnitude is consistent with previous studies 
in this domain (meta-analytic mean r = .31; Smith et al., 2023)."
```

### Regression Coefficients (β, b)

**Standardized (β)**:
```
Interpreted like correlation
Comparable across predictors in same model

Example:
"Social media use was a stronger predictor (β = .28) than loneliness 
(β = .16) or stress (β = .12)."
```

**Unstandardized (b)**:
```
Interpreted in original units
Necessary for replication

Example:
"Each additional hour of social media use per day predicted 1.2-point increase 
in PHQ-9 score, b = 1.20, 95% CI [0.65, 1.75]."
```

### Odds Ratios (OR)

**Interpretation**:
```
OR = 1.0: No association
OR > 1.0: Exposure increases odds of outcome
OR < 1.0: Exposure decreases odds of outcome

Example:
"Smokers had 3.4 times higher odds of lung cancer compared to non-smokers, 
OR = 3.4, 95% CI [1.8, 6.4]."
```

**Common Misinterpretation**:
```
❌ OR does NOT equal relative risk
❌ For common outcomes (>10%), OR overestimates RR

Only when outcome is rare (<10%) does OR approximate RR
```

### R² (Variance Explained)

**Benchmarks** (Cohen):
```
Small: R² = .02
Medium: R² = .13
Large: R² = .26
```

**Field Variations**:
```
Physical sciences: R² = .80 expected
Psychology: R² = .20 is good
Social sciences: R² = .10 is typical

Always contextualize
```

**Report**:
```
"The full model explained 21% of variance in depression scores, R² = .21, 
F(5, 384) = 20.45, p < .001. Social media use uniquely explained 3% of 
variance beyond other predictors, ΔR² = .03, p = .003."
```

---

## COMMON ERRORS IN OBSERVATIONAL RESEARCH

### Error 1: Causal Language (Most Critical)

```
See Phase 3 above - this is the #1 error in observational studies

FLAG EVERY INSTANCE of causal verbs in Results/Discussion
```

### Error 2: Ignoring Confounds

```
❌ "We found social media use correlates with depression, r = .34, p < .001."
   (No confound control)

✓ "After controlling for age, sex, baseline mental health, social support, 
  and stress, social media use remained associated with depression, β = .18, 
  p = .003."
```

### Error 3: Not Reporting Unadjusted Estimates

```
STROBE requires BOTH unadjusted and adjusted

❌ Only reporting adjusted: "Social media use predicted depression, β = .18"

✓ Reporting both: "Unadjusted: β = .34. Adjusted for covariates: β = .18."
```

### Error 4: Cross-Sectional Directionality Claims

```
❌ "Social media use leads to depression"
❌ "Depression is a consequence of social media use"

✓ "Social media use and depression were positively associated. The cross-
  sectional design precludes determination of temporal order."
```

### Error 5: Ignoring Non-Response Bias

```
❌ 18% response rate with no discussion

✓ "Response rate was 18%. Respondents differed from non-respondents on sex 
  (χ² = 12.4, p < .001), limiting generalizability. Results should be 
  interpreted cautiously."
```

### Error 6: Attrition Not Analyzed (Cohort)

```
❌ "15% lost to follow-up" (no analysis of who was lost)

✓ "Those lost to follow-up were younger and had higher baseline depression, 
  suggesting results may underestimate the true association (selective attrition)."
```

### Error 7: Treating OR as RR

```
❌ "Smokers were 3.4 times more likely to develop cancer" 
   (from case-control OR = 3.4)

✓ "Smokers had 3.4 times higher odds of cancer. Odds ratios from case-control 
  designs do not estimate relative risk."
```

---

## FIELD-SPECIFIC VARIATIONS

### Epidemiology

**Additional Requirements**:
- Incidence AND prevalence reported when applicable
- Person-time carefully calculated and reported
- Survival curves (Kaplan-Meier) for cohort studies
- Detailed exposure assessment
- Dose-response analysis when possible

**Terminology**:
- Risk factors (not predictors)
- Incidence, prevalence, attack rate
- Hazard ratio, relative risk, attributable risk

### Psychology / Social Sciences

**Common Designs**:
- Cross-sectional surveys (most common)
- Correlational designs
- Longitudinal panels (repeated cross-sections)

**Instrument Validation Critical**:
- Report Cronbach's α for all scales
- Cite validation studies
- Report fit indices if using latent variables (CFA)

**Structural Equation Modeling (SEM)**:
```
If used, report:
- Model fit: CFI, TLI, RMSEA, SRMR
- Factor loadings
- Path coefficients with CIs
```

### Public Health / Health Services Research

**Focus on Translation**:
- Clinical significance alongside statistical significance
- Public health impact estimates
- Cost-effectiveness implications

**Example**:
```
"Although the association was small (r = .18), at population scale this 
translates to an estimated 12,000 additional depression cases per year 
attributable to high social media use (assuming causal relationship)."
```

---

## SPECIAL TOPIC: LONGITUDINAL PANEL STUDIES

**Design**: Multiple measurement waves, same individuals

**Advantages**:
- Can examine change over time
- Within-person changes examined
- Temporal precedence partially established

**Analysis Approaches**:

**Cross-Lagged Panel Models**:
```
Test reciprocal effects

Example:
"Social media use at T1 predicted depression at T2 (β = .23, p = .003), 
controlling for T1 depression. Depression at T1 also predicted social media 
use at T2 (β = .17, p = .024), suggesting bidirectional relationship."
```

**Growth Curve Modeling**:
```
Examine trajectories over time

Example:
"Linear mixed models indicated depression increased over 4 years (b = 0.45 
points/year, p = .001). Baseline social media use predicted steeper increases 
(interaction: b = 0.12, p = .035)."
```

**Fixed Effects Models**:
```
Control for all time-invariant confounds (within-person analysis)

Example:
"Fixed effects model examining within-person changes: increases in social 
media use within individuals predicted subsequent increases in depression, 
b = 0.87, p = .006."
```

---

## RESOURCES FOR OBSERVATIONAL RESEARCH

### Core Standards
- STROBE Statement: https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0040297
- STROBE Explanation & Elaboration: https://pmc.ncbi.nlm.nih.gov/articles/PMC6398292/

### Causal Language
- Being Honest with Causal Language (Wiley): https://onlinelibrary.wiley.com/doi/10.1111/jan.14311

### Statistical Analysis
- APA 7th Statistics Guide: https://apastyle.apa.org/instructional-aids/numbers-statistics-guide.pdf
- Effect Size Interpretation: https://www.tandfonline.com/doi/full/10.1111/j.1742-9536.2011.00037.x

### Confounding
- UCLA Regression Examples: https://stats.idre.ucla.edu/other/mult-pkg/whatstat/
- Propensity Score Methods: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3144483/

---

## ADVANCED CONFOUND ANALYSIS (EXPANDED)

### Over-Adjustment & Mediation Bias
Flag if manuscripts adjust for variables on the causal pathway between exposure and outcome:

```
OVER-ADJUSTMENT:
❌ "We controlled for education and income" (if these are mediators of the exposure)
✓ "Education (potential mediator) was examined in a separate sensitivity analysis"

MEDIATION BIAS:
If Variable M sits on causal path: Exposure → M → Outcome
- Adjusting for M REMOVES the indirect effect
- Only adjust for confounders (common causes), NOT mediators (consequences)
```

### Collider Bias Detection
Conditioning on a common effect of exposure AND outcome introduces spurious associations:

```
COLLIDER BIAS MATRIX:
Variable is a COMMON CAUSE of exposure AND outcome → ADJUST ✓ (confounder)
Variable is a COMMON EFFECT of exposure AND outcome → DO NOT ADJUST ❌ (collider)
Variable is on causal pathway → DO NOT ADJUST ❌ (mediator)

Example:
Exposure: Air pollution → Outcome: Lung disease
"Hospitalization" is a COLLIDER (caused by both pollution AND lung disease)
❌ Adjusting for hospitalization introduces selection bias

FLAG if: Adjustment set not justified, or no DAG (directed acyclic graph) presented
```

### Negative/Unmeasured Confounding
```
REQUIRE in Limitations:
1. "Residual confounding from unmeasured variables cannot be excluded"
2. List plausible unmeasured confounders specific to the study
3. State direction of expected bias (toward null or away from null)

BONUS: E-value analysis to assess robustness to unmeasured confounding
```

---

**END OF MODULE 02: OBSERVATIONAL/CORRELATIONAL**

*This module covers cohort, case-control, cross-sectional, and survey studies without experimental manipulation. For randomized experiments, use MODULE 01: QUANTITATIVE EXPERIMENTAL.*

**Version**: 3.0
**Last Updated**: February 2026
**Maintained By**: SAGE Development Team
