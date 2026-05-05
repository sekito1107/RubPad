import { proxy } from 'valtio';

type Entry = {
  name: string;
  line: number;
  col: number;
};

export type MethodCall = Entry;
export type VariableDefinition = Entry;

export const analysis = proxy<{
  methods: MethodCall[];
  variables: VariableDefinition[];
}>({
  methods: [],
  variables: [],
});
