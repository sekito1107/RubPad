import { proxy } from 'valtio';

export type MethodInfo = {
  name: string;
  line: number;
  col: number;
  info: {
    owner: string | null;
    owner_type: 'class' | 'module' | null;
    is_singleton_call: boolean;
    has_instance: boolean;
    has_singleton: boolean;
    type_info: string | null;
  };
};

export type VariableDefinition = {
  name: string;
  line: number;
  col: number;
  type_info: string | null;
};

export const analysis = proxy<{
  methods: MethodInfo[];
  variables: VariableDefinition[];
  literals: VariableDefinition[];
}>({
  methods: [],
  variables: [],
  literals: [],
});
