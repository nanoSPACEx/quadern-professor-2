import { Task, Student, Group } from './types';

export const TASKS: Task[] = [
  { id: 't1', name: 'DISSENYA UNA PORTADA', type: 'treball', weight: 1, term: 1 },
  { id: 't2', name: 'TEORIA DE GEOMETRIA', type: 'treball', weight: 1, term: 1 },
  { id: 't3', name: 'VISUAL VOCABULARY BANK', type: 'treball', weight: 1, term: 1 },
  { id: 't4', name: 'SET SQUARE', type: 'treball', weight: 1, term: 1 },
  { id: 't5', name: 'PRÀCTICA DE PARAL.LELISME', type: 'treball', weight: 1, term: 1 },
  { id: 't6', name: 'COMPOSICIÓ LLIURE AMB PARAL.LELES', type: 'treball', weight: 1, term: 1 },
  { id: 't7', name: 'OPERACIONS AMB SEGMENTS', type: 'treball', weight: 1, term: 1 },
  { id: 't8', name: 'MEDIATRIU', type: 'treball', weight: 1, term: 1 },
  { id: 't9', name: 'TEOREMA DE TALES', type: 'treball', weight: 1, term: 1 },
  { id: 't10', name: 'COPIA. OPERACIONS AMB ANGLES', type: 'treball', weight: 1, term: 1 },
  { id: 't11', name: "SUMA D'ANGLES", type: 'treball', weight: 1, term: 1 },
  { id: 't12', name: "RESTA D'ANGLES", type: 'treball', weight: 1, term: 1 },
  { id: 't13', name: 'BISECTRIUS', type: 'treball', weight: 1, term: 1 },
  { id: 't14', name: 'ELEMENTS DE LA CIRCUMFERÈNCIA', type: 'treball', weight: 1, term: 1 },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'García, Maria',
    grades: { t1: 8.5, t2: 7.0, t3: 9.0, t4: 6.5, t5: 8.0, t6: 7.5, t7: 8.0, t8: 9.5, t9: 7.0, t10: 8.5, t11: 9.0, t12: 8.0, t13: 7.5, t14: 8.5 },
  },
  {
    id: 's2',
    name: 'Martínez, Joan',
    grades: { t1: 6.0, t2: 5.5, t3: 7.0, t4: 4.5, t5: 6.0, t6: 5.0, t7: 6.5, t8: 5.5, t9: 4.0, t10: 6.0, t11: 5.5, t12: 6.0, t13: 5.0, t14: 6.5 },
  },
  {
    id: 's3',
    name: 'López, Anna',
    grades: { t1: 9.5, t2: 9.0, t3: 10.0, t4: 8.5, t5: 9.5, t6: 9.0, t7: 9.5, t8: 10.0, t9: 8.5, t10: 9.5, t11: 10.0, t12: 9.5, t13: 9.0, t14: 9.5 },
  },
  {
    id: 's4',
    name: 'Sánchez, Marc',
    grades: { t1: 4.0, t2: 3.5, t3: 5.0, t4: 2.5, t5: 4.0, t6: 3.0, t7: 4.5, t8: 3.5, t9: 2.0, t10: 4.0, t11: 3.5, t12: 4.0, t13: 3.0, t14: 4.5 },
  },
  {
    id: 's5',
    name: 'Pérez, Laura',
    grades: { t1: 7.5, t2: 8.0, t3: 7.0, t4: 9.0, t5: 7.5, t6: 8.5, t7: 7.0, t8: 8.0, t9: 9.5, t10: 7.5, t11: 8.0, t12: 7.5, t13: 8.5, t14: 7.0 },
  },
];

export const DEFAULT_GROUP: Group = {
  id: 'g1',
  name: '1r ESO A',
  year: '2025-2026',
  tasks: TASKS,
  students: INITIAL_STUDENTS,
};

