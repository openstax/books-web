// from https://docs.google.com/spreadsheets/d/1Hj5vm2AbEiLgxgcbNRi550InzFTLvBOv16-Fw6P-c5E/edit#gid=2066350488
export const CANONICAL_MAP: ObjectLiteral<string[] | undefined> = {
  /* Algebra & Trigonometry */ '13ac107a-f15f-49d2-97e8-60ab2e3b519c' : [
    /* College Algebra */ '9b08c294-057f-4201-9f48-5d6ad992740d',
    /* Precalculus */ 'fd53eae1-fa23-47c7-bb1b-972349835c3c',
  ],
  /* Principles of Macroeconomics 2e */ '27f59064-990e-48f1-b604-5188b9086c29': [
    /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82',
  ],
  /* Organizational Behavior */ '2d941ab9-ac5b-4eb8-b21c-965d36a4f296': [
    /* Principles of Management */'c3acb2ab-7d5c-45ad-b3cd-e59673fedd4e',
  ],
  /* Principles of Microeconomics 2e */ '5c09762c-b540-47d3-9541-dda1f44f16e5': [
    /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82',
  ],
  /* Principles of Microeconomics 2e for AP Courses */ '636cbfd9-4e37-4575-83ab-9dec9029ca4e': [
    /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82',
  ],
  /* Principles of Macroeconomics 2e for AP Courses */ '9117cf8c-a8a3-4875-8361-9cb0f1fc9362': [
    /* Principles of Economics 2e */'bc498e1f-efe9-43a0-8dea-d3569ad09a82',
  ],
  /* Introductory Business Statistics */ 'b56bb9e9-5eb8-48ef-9939-88b1b12ce22f': [
    /* Introductory Statistics */ '30189442-6998-4686-ac05-ed152b91b9de',
  ],
  /* Chemistry: Atoms First 2e */ 'd9b85ee6-c57f-4861-8208-5ddf261e9c5f' : [
    /* Chemistry 2e */ '7fccc9cf-9b71-44f6-800b-f9457fd64335',
  ],
  /* Precalculus */ 'fd53eae1-fa23-47c7-bb1b-972349835c3c' : [
    /* College Algebra */ '9b08c294-057f-4201-9f48-5d6ad992740d',
  ],
};

interface ObjectLiteral<V> {
  [key: string]: V;
}
