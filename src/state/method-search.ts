import { proxy } from 'valtio';

export const methodSearch = proxy<{
  selectedClass: string | null;
  methods: { name: string; owner: string }[];
  isOpen: boolean;
}>({
  selectedClass: null,
  methods: [],
  isOpen: false,
});
