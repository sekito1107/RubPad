import { proxy } from 'valtio';

export interface MethodCall {
  name: string;
  line: number;
  col: number;
}

export const analysis = proxy<{
  methods: MethodCall[];
}>({
  methods: [],
});
