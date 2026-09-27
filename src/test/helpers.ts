import { useTaskStore, initialFilter } from "@/store/taskStore";

/** Full store reset between tests (state + persisted storage). */
export function resetStore() {
  // setState first (persist middleware writes on every set),
  // then wipe storage so each test starts from a clean slate.
  useTaskStore.setState({
    tasks: [],
    categories: [],
    filter: { ...initialFilter, tags: [] },
    sort: "manual",
    savedViews: [],
    lastDeleted: null,
    toasts: [],
    sidebarOpen: false,
    managerOpen: false,
    detailId: null,
  });
  localStorage.clear();
}
