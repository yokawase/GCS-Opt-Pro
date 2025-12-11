import { Sex, ComorbidityLevel, SimulationResult, GuidanceResult, CancerType } from '../types';

// --- Logic & Constants ---
const MORTALITY_PARAMS = {
  Male: { a: 0.00005, b: 0.085, c: 0.0005 },
  Female: { a: 0.00003, b: 0.090, c: 0.0002 }
};

const COMORBIDITY_HR = {
  none: 1.0,
  mild: 1.5,
  severe: 3.0
};

const RR_ERADICATION = 0.33;

// Calculate Qx
const getQxTotal = (age: number, sex: Sex, comorbidityLevel: ComorbidityLevel | 'none'): number => {
  const p = MORTALITY_PARAMS[sex];
  let qx = p.a * Math.exp(p.b * age) + p.c;
  const hr = COMORBIDITY_HR[comorbidityLevel];
  qx = qx * hr;
  return Math.min(qx, 0.99);
};

const getQxGC = (age: number, sex: Sex): number => {
  const p = MORTALITY_PARAMS[sex];
  const baseQx = p.a * Math.exp(p.b * age);
  const riskFactor = sex === 'Male' ? 1.0 : 0.5;
  const gcHazard = 0.00001 * Math.pow(Math.max(0, age - 35), 2.5) * riskFactor;
  return Math.min(gcHazard, baseQx * 0.15);
};

// Main Simulation Function
export const calculateSimulation = (age: number, sex: Sex, comorbidity: ComorbidityLevel): SimulationResult => {
  const startAge = age;
  const cohortSize = 100000;
  const maxAge = 105;

  // Variables for Personal Scenario (with comorbidity)
  let current_lx_base = cohortSize;
  let current_lx_int = cohortSize;
  let years_base = 0;
  let years_int = 0;

  // Variables for Reference Standard Scenario (Healthy, no comorbidity)
  let current_lx_ref = cohortSize;
  let years_ref = 0;

  const survivalData: { age: number; Base: number; Intervention: number }[] = [];

  for (let t = startAge; t < maxAge; t++) {
    // 1. Personal Hazards
    const qx_total = getQxTotal(t, sex, comorbidity);
    const qx_gc = getQxGC(t, sex);
    const qx_other = Math.max(0, qx_total - qx_gc);

    // Personal: Baseline vs Intervention
    const prob_death_base = qx_total;
    const prob_death_int = qx_other + (qx_gc * RR_ERADICATION);

    // 2. Reference Hazards (Healthy)
    const qx_ref = getQxTotal(t, sex, 'none');

    // 3. Update Personal Cohorts
    const deaths_base = current_lx_base * prob_death_base;
    const next_lx_base = current_lx_base - deaths_base;

    const deaths_int = current_lx_int * prob_death_int;
    const next_lx_int = current_lx_int - deaths_int;

    // 4. Update Reference Cohort
    const deaths_ref = current_lx_ref * qx_ref;
    const next_lx_ref = current_lx_ref - deaths_ref;

    // 5. Accumulate Life Years (Trapezoidal)
    years_base += (current_lx_base + next_lx_base) / 2;
    years_int += (current_lx_int + next_lx_int) / 2;
    years_ref += (current_lx_ref + next_lx_ref) / 2;

    // Store Data
    if (t % 5 === 0 || t === startAge) {
      survivalData.push({
        age: t,
        Base: parseFloat((current_lx_base / 1000).toFixed(1)),
        Intervention: parseFloat((current_lx_int / 1000).toFixed(1)),
      });
    }

    current_lx_base = next_lx_base;
    current_lx_int = next_lx_int;
    current_lx_ref = next_lx_ref;

    if (current_lx_base < 100) break;
  }

  // Calculate Life Expectancies
  const ex_personal = years_base / cohortSize;
  const ex_reference = years_ref / cohortSize;
  const ex_intervention = years_int / cohortSize;

  const gain_years = ex_intervention - ex_personal;
  const gain_days = gain_years * 365.25;

  return {
    gainDays: gain_days,
    personalEx: ex_personal,
    referenceEx: ex_reference,
    survivalData: survivalData
  };
};

// --- Guideline Logic (Updated with Life Expectancy) ---
export const getScreeningGuidance = (
  type: CancerType,
  age: number,
  sex: Sex,
  comorbidity: ComorbidityLevel,
  isSmoker: boolean,
  lifeExpectancy: number
): GuidanceResult => {
  // "10-year rule": Generally, if LE < 10 years, screening is not recommended.
  const isLimitedLE = lifeExpectancy < 10;
  let status: GuidanceResult['status'] = 'recommended';
  let message = '';

  // Override for severe comorbidity or very short LE
  if (comorbidity === 'severe' || lifeExpectancy < 5) {
    return {
      status: 'not_recommended',
      message: `期待余命が短いため（${lifeExpectancy.toFixed(1)}年）、検診の負担がメリットを上回ります。対症療法を優先してください。`
    };
  }

  switch (type) {
    case 'gastric':
      if (age < 50) {
        status = 'recommended';
        message = 'ピロリ菌感染確認・除菌を推奨。';
      } else if (age <= 74 && !isLimitedLE) {
        status = 'recommended';
        message = '推奨年齢です。除菌による余命延長効果が期待できます。';
      } else if (age <= 79) {
        status = 'shared';
        message = '75歳以上では余命延長効果が低下します。個別に判断してください。';
      } else {
        status = 'not_recommended';
        message = '80歳以上または余命10年未満では、メリットは限定的です。';
      }
      break;

    case 'colorectal':
      if (age < 40) {
        status = 'not_recommended';
        message = '40歳未満は対象外です（家族歴を除く）。';
      } else if (age <= 75 && !isLimitedLE) {
        status = 'recommended';
        message = '75歳までは便潜血検査が強く推奨されます。';
      } else if (age <= 85 && !isLimitedLE) {
        status = 'shared';
        message = '76-85歳は健康状態に応じて判断します。';
      } else {
        status = 'not_recommended';
        message = '86歳以上または余命10年未満では推奨されません（USPSTF）。';
      }
      break;

    case 'lung':
      if (!isSmoker) {
        status = 'not_recommended';
        message = '非喫煙者のCT検診推奨度は低いです。';
      } else {
        if (age >= 50 && age <= 80 && !isLimitedLE) {
          status = 'recommended';
          message = '高リスク群（喫煙者）には低線量CTが推奨されます。';
        } else {
          status = 'not_recommended';
          message = '適応外または余命等を考慮し推奨されません。';
        }
      }
      break;

    case 'breast':
      if (sex !== 'Female') {
        status = 'not_recommended';
        message = '-';
      } else {
        if (age >= 40 && age <= 74 && !isLimitedLE) {
          status = 'recommended';
          message = '推奨年齢です（マンモグラフィ）。';
        } else if (age >= 75 && !isLimitedLE) {
          status = 'shared';
          message = '75歳以上はエビデンス不十分。余命10年以上なら考慮。';
        } else {
          status = 'not_recommended';
          message = '適応外または余命10年未満のため推奨されません。';
        }
      }
      break;

    case 'cervical':
      if (sex !== 'Female') {
        status = 'not_recommended';
        message = '-';
      } else {
        if (age >= 20 && age <= 65) {
          status = 'recommended';
          message = '推奨年齢です（細胞診/HPV）。';
        } else {
          status = 'not_recommended';
          message = '65歳以上で十分な陰性歴があれば終了可能です。';
        }
      }
      break;
  }

  // Apply 10-year rule overlay if not already strictly handled
  if (isLimitedLE && status === 'recommended') {
    status = 'shared';
    message += ' (注: 期待余命が10年未満のため、慎重な判断が必要です)';
  }

  return { status, message };
};