export default function SuggestionChip({ children, onClick }) {
  return (
    <button onClick={onClick} className="chip t-fast rounded-full px-3.5 py-2 text-left text-[13px] font-medium">
      {children}
    </button>
  );
}
