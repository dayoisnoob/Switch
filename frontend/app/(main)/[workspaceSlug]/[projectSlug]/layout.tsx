export default function ProjectLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children} {/* This renders your KanbanBoardPage */}
      {modal} {/* This renders the intercepted modal */}
    </>
  );
}
