# SAGE MODULE GUIDE
**For AI System: How to Use the Modular Architecture**
**Version 3.0**
**Last Updated: February 2026**

---

## SYSTEM OVERVIEW

SAGE uses a **modular architecture** with:
- **1 CORE file** (universal standards, all papers)
- **6 MODULE files** (type-specific standards)
- **Module loading logic** (based on paper type)

---

## MODULE LOADING DECISION TREE

### Step 1: Determine Paper Type

**User Selection Path**:
```
IF user selects specific type:
   → Load CORE + selected module
   → Proceed to analysis
```

**Auto-Detection Path**:
```
IF user selects "Not Sure":
   → Scan manuscript for keywords (see CORE Item: Auto-Detection)
   → Present detection: "I detected: [Type]. Is this correct?"
   → User confirms or corrects
   → Load CORE + appropriate module(s)
```

**Generic Path**:
```
IF user selects "Generic Review":
   → Load CORE + Module 06 (Generic)
   → Flag potential type during analysis
   → Suggest re-analysis with specific module
```

### Step 2: Load Files

**Standard Load** (Most cases):
```
LOAD: 00_CORE + 0X_MODULE_[TYPE]

Example: Quantitative RCT
LOAD: 00_CORE + 01_QUANTITATIVE_EXPERIMENTAL
```

**Mixed Methods Load**:
```
LOAD: 00_CORE + 05_MIXED_METHODS + relevant quant/qual modules

Example: Sequential Explanatory (survey → interviews)
LOAD: 00_CORE + 05_MIXED_METHODS + 02_OBSERVATIONAL + 03_QUALITATIVE
```

**Generic Load**:
```
LOAD: 00_CORE + 06_GENERIC
```

### Step 3: Analysis Priority

```
1. Check TYPE-SPECIFIC standards (from module)
2. Check UNIVERSAL standards (from CORE)
3. Generate feedback using module templates
```

---

## MODULE COMPATIBILITY MATRIX

| Paper Type | CORE | Module 01 | Module 02 | Module 03 | Module 04 | Module 05 | Module 06 |
|------------|------|-----------|-----------|-----------|-----------|-----------|-----------|
| RCT/Experiment | ✓ | ✓ | | | | | |
| Observational | ✓ | | ✓ | | | | |
| Qualitative | ✓ | | | ✓ | | | |
| Systematic Review | ✓ | | | | ✓ | | |
| Mixed (Quant→Qual) | ✓ | * | * | * | | ✓ | |
| Uncertain | ✓ | | | | | | ✓ |

*Load relevant quant/qual modules based on methods used

---

## COMMON LOADING SCENARIOS

### Scenario 1: Clear RCT
```
Keywords: "randomized," "control group," "blinding," "CONSORT"
LOAD: CORE + Module 01
CHECK: CONSORT 2025 compliance, causal language allowed, ITT analysis
```

### Scenario 2: Cross-Sectional Survey
```
Keywords: "survey," "correlation," "cross-sectional," "no manipulation"
LOAD: CORE + Module 02
CHECK: STROBE compliance, NO causal language, confound discussion
```

### Scenario 3: Phenomenology Study
```
Keywords: "lived experience," "interviews," "themes," "phenomenology"
LOAD: CORE + Module 03
CHECK: COREQ compliance, reflexivity, saturation, quality criteria
```

### Scenario 4: Meta-Analysis
```
Keywords: "systematic review," "meta-analysis," "PRISMA," "pooled"
LOAD: CORE + Module 04
CHECK: PRISMA 2020, PROSPERO registration, forest plot, GRADE
```

### Scenario 5: Sequential Mixed Methods
```
Keywords: "mixed methods," "survey," "interviews," "sequential explanatory"
LOAD: CORE + Module 05 + Module 02 + Module 03
CHECK: Integration points, GRAMMS, both quant and qual standards
```

### Scenario 6: Unclear/Complex
```
Keywords: Mixed or ambiguous
LOAD: CORE + Module 06
ANALYZE: Flag type indicators, suggest specific module
```

---

## TROUBLESHOOTING

### Multiple Modules Triggered?

**Mixed Methods** - Load all:
```
QUAN→qual: CORE + 05 + 01/02 + 03
QUAL→quan: CORE + 05 + 03 + 01/02
Convergent: CORE + 05 + 01/02 + 03
```

**Embedded Design** - Primary + secondary:
```
RCT with embedded qual: CORE + 01 + 03 + 05
```

**Multi-Phase** - Load all relevant:
```
Phase 1 qual → Phase 2 RCT: CORE + 03 + 01 + 05
```

### No Clear Type?

**Option A**: Use Generic Module
```
LOAD: CORE + 06
Broad analysis, suggest refinement
```

**Option B**: Ask User
```
"I detected keywords suggesting [Type A] and [Type B]. Which best describes 
your study? Or would you prefer comprehensive Generic review?"
```

### Conflicting Standards?

**Prioritize**:
1. Module-specific standards (most relevant)
2. Core universal standards
3. Note conflicts in feedback

**Example**:
```
Module 02 forbids causal language
Module 01 allows causal language
→ Follow Module 02 if observational loaded
→ Follow Module 01 if experimental loaded
```

---

## FEEDBACK GENERATION

### Use Module Templates

Each module provides:
- Feedback structure templates
- Severity indicators (🔴 🟡 🔵)
- Example language
- Resource links

**Follow module's tone and depth**:
```
Module 01: "Independent samples t-test missing Cohen's d. Calculate as..."
Module 06: "Statistical reporting incomplete. Consider adding effect sizes."
```

### Combine Core + Module Feedback

**Structure**:
```
1. CRITICAL issues (module-specific first)
2. IMPORTANT issues (module then core)
3. MINOR issues (module then core)
4. STRENGTHS
5. PRIORITY ACTIONS
```

### Cross-Reference Modules

**When relevant**:
```
"Your observational design (Module 02) cannot support causal claims. If you 
conducted an experiment with random assignment, re-analyze with Module 01 
for appropriate causal language guidance."
```

---

## QUALITY CHECKS

### Before Finalizing Analysis:

- [ ] Correct modules loaded for paper type?
- [ ] Module-specific standards checked?
- [ ] Core universal standards checked?
- [ ] Feedback uses module-appropriate language?
- [ ] Resources linked from correct module?
- [ ] Severity levels appropriate for type?

---

## VERSION CONTROL

When modules updated:
1. Update version number in module file
2. Update "Last Updated" date
3. Note changes in module
4. Update this guide if loading logic changes

---

**END OF MODULE GUIDE**

*This guide is for SAGE's AI system. Users should refer to SAGE_PAPER_TYPES_EXPLAINED.md for help choosing paper type.*
