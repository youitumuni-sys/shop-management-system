import { TodoList } from "@/components/features/todos";

export default function TodosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">やることリスト</h1>
      <TodoList />
    </div>
  );
}
