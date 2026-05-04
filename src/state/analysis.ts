import { proxy } from 'valtio';

export interface ScannedSymbol {
  name: string;
  line: number;
  col: number;
}

export const analysis = proxy<{
  methods: ScannedSymbol[];
}>({
  methods: [],
});
