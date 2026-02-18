import { StudentList } from "@/components/students/student-list";

export default function HomePage() {
  return <div className="overflow-y-auto flex-1 min-h-0"><StudentList /></div>;
}
