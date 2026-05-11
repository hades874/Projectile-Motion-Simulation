import homeBn from './home.bn.json';
import homeEn from './home.en.json';
import forcesBn from './forces.bn.json';
import forcesEn from './forces.en.json';
import juniorBn from './junior.bn.json';
import juniorEn from './junior.en.json';
import seniorBn from './senior.bn.json';
import seniorEn from './senior.en.json';
import glossaryBn from './glossary.bn.json';
import glossaryEn from './glossary.en.json';

const translations = {
  bn: {
    home: homeBn,
    forces: forcesBn,
    junior: juniorBn,
    senior: seniorBn,
    glossary: glossaryBn,
  },
  en: {
    home: homeEn,
    forces: forcesEn,
    junior: juniorEn,
    senior: seniorEn,
    glossary: glossaryEn,
  }
};

export const getTranslations = (lang) => {
  return translations[lang] || translations.bn;
};

export default translations;
