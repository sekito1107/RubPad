import { proxy } from 'valtio';


export interface AnalysisSymbol {
  name: string;
  line: number;
  col: number;
}

export const analysis = proxy<{
  methods: AnalysisSymbol[];
  variables: AnalysisSymbol[];
}>({
  methods: [],
  variables: [],
});
