# SAGE MODULE: GENERIC REVIEW
**Module 06 - Comprehensive Multi-Type Analysis**
**Version 3.0**
**Last Updated: February 2026**

---

## MODULE PURPOSE

This module provides **comprehensive coverage** when:
- User selects "Generic Review" 
- Auto-detection fails or is uncertain
- Paper doesn't fit standard categories
- Multiple methodologies present

**Approach**: Check all major standards, flag issues, suggest specific module if applicable.

---

## ANALYSIS STRATEGY

### 1. Attempt Classification

Scan manuscript for dominant methodology:
- Experimental manipulation? → Suggest Module 01
- Observation without manipulation? → Suggest Module 02  
- Non-numerical themes/interviews? → Suggest Module 03
- Synthesis of existing studies? → Suggest Module 04
- Both quant + qual integrated? → Suggest Module 05

### 2. Apply Universal Standards

Check ALL universal standards from CORE:
- Title, abstract, keywords
- Writing quality
- Figures/tables
- References
- Ethics/transparency
- AI disclosure

### 3. Check Applicable Reporting Guidelines

**If mentions randomization**: Check CONSORT basics
**If mentions cohort/case-control**: Check STROBE basics  
**If mentions interviews**: Check COREQ basics
**If synthesis of studies**: Check PRISMA basics

### 4. Flag Methodology-Specific Issues

**Causal language in observational context**:
```
🟡 POTENTIAL ISSUE: Causal Language Detected

Your manuscript uses "X caused Y" but appears to be observational (no 
randomization mentioned). If this is an observational study, causal language 
must be changed to associational language.

RECOMMENDATION: If experimental design, clarify randomization. If observational, 
use "associated with" instead of "caused."

Consider using Module 02 (Observational) for more targeted analysis.
```

**Missing statistical basics**:
```
🟡 IMPORTANT: Effect sizes missing with p-values

APA 7th requires effect sizes. Add Cohen's d, r, η², or appropriate measure.

For detailed statistical guidance, consider Module 01 or 02 depending on design.
```

**Qualitative without quality criteria**:
```
🟡 IMPORTANT: Qualitative Quality Criteria Missing

If qualitative study, must address credibility, transferability, dependability, 
confirmability - NOT validity/reliability.

For detailed qualitative guidance, use Module 03.
```

---

## GENERIC FEEDBACK STRUCTURE

**Less Specific Than Targeted Modules**:
```
Generic: "Statistical reporting appears incomplete. Consider adding effect sizes."

vs.

Module 01: "Independent samples t-test missing Cohen's d. Calculate as 
(M₁-M₂)/SD_pooled. Example: d = 0.72, 95% CI [0.38, 1.06]. See APA 7th 
Statistics Guide."
```

**Flags Potential Issues, Suggests Refinement**:
```
"Your Methods section describes interviews with 15 participants and thematic 
analysis. This suggests a qualitative design. For more comprehensive analysis 
of qualitative standards (COREQ compliance, reflexivity, saturation), consider 
re-analyzing with Module 03: Qualitative Research."
```

---

## COVERAGE AREAS

### Basic Structure (All Papers)
- Title length and clarity
- Abstract completeness (background, methods, results, conclusions)
- Keywords alignment with content
- Logical flow (intro → methods → results → discussion)

### Methods Basics
- Sample/participants described
- Procedures described
- Analysis approach stated
- Ethics approval mentioned

### Results Basics  
- Findings reported clearly
- Tables/figures appropriate
- Statistics include CIs where applicable

### Discussion Basics
- Findings interpreted
- Limitations acknowledged  
- Conclusions supported by results

---

## WHEN TO RECOMMEND SPECIFIC MODULE

**Strong Indicators**:
```
Randomization + control group → Module 01
Correlation/regression + no manipulation → Module 02
Interviews/themes + no numbers → Module 03
Synthesis of existing studies + PRISMA → Module 04
Explicitly states "mixed methods" → Module 05
```

**Recommendation Format**:
```
"RECOMMENDATION: Your manuscript appears to be a [Type]. For more precise, 
comprehensive feedback aligned with [Reporting Guideline], re-analyze using 
Module [0X]: [Name].

Generic module provides broad coverage but may miss field-specific standards. 
Targeted module will provide:
- Specific reporting guideline compliance (e.g., CONSORT, STROBE, COREQ)
- Field-appropriate language checks
- Methodology-specific common errors
- Detailed templates and examples"
```

---

## LIMITATIONS OF GENERIC MODULE

**User Should Know**:
```
"Generic module provides comprehensive coverage of universal standards but 
cannot match the depth and specificity of targeted modules. For publication-
ready analysis, consider selecting or allowing auto-detection of your specific 
research type."
```

**What Generic Module Provides**:
- ✓ Universal writing/formatting standards
- ✓ Basic methodology checks
- ✓ Broad coverage across types
- ✓ Identification of major issues

**What Targeted Modules Add**:
- ✓ Reporting guideline item-by-item compliance
- ✓ Field-specific terminology and conventions
- ✓ Detailed statistical/analytical guidance
- ✓ Type-specific common errors and solutions

---

**END OF MODULE 06: GENERIC REVIEW**

*For optimal analysis, identify specific research type and use targeted module.*
