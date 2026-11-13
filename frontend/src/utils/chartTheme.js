import { useTheme } from '../context/Theme';

const LIGHT = {
  income: '#157A60',
  expense: '#C23B22',
  savings: '#2B7CB8',
  brand: '#2F3FA8',
  grid: '#D3DAE2',
  axis: '#586374',
  cursor: 'rgba(24, 34, 47, 0.06)',
  categories: ['#2F3FA8', '#E9A21B', '#157A60', '#C23B22', '#2B7CB8', '#8A4F8F', '#6B7788'],
};

const DARK = {
  income: '#3CC9A0',
  expense: '#FF7A5C',
  savings: '#5AB0F0',
  brand: '#8C9BFF',
  grid: '#2A3544',
  axis: '#A0ACBD',
  cursor: 'rgba(255, 255, 255, 0.06)',
  categories: ['#8C9BFF', '#F2B33D', '#3CC9A0', '#FF7A5C', '#5AB0F0', '#C58BCB', '#8B98AA'],
};

export const useChartTheme = () => (useTheme().resolved === 'dark' ? DARK : LIGHT);
