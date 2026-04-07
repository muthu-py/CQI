# Teacher Performance Module

This analytics engine is built to evaluate pure academic output tracking straight from a specific teaching faculty's classroom. 

Rather than relying on subjective survey data, it strictly processes all granular points scored inside the teacher's configured `SUBJECT_OFFERING` exams, scientifically providing two absolute mathematical metrics correlating their effectiveness:

## 1. Global Average Performance (`avg_score`)
This gathers absolutely **all points assigned and obtained** across tracking systems within their assigned sections. It measures the fundamental class passing percentages across theory, lab, internal, or external components comprehensively.

*Math logic:* 
`(Total Obtained Marks across all Questions) / (Total Valid Max Marks offered) * 100`.

## 2. Curriculum Effectiveness (`co_attainment_score`)
While students might pass an exam, they might be failing specific designated core curriculum standards constraint questions defined natively in the mapping module. 

This metric explicitly ignores unmapped generic test parameters, and aggregates strictly **only** the fractional points extracted from questions mathematically tracked to an established Course Outcome (`CO`). It calculates success over officially targeted framework guidelines!
