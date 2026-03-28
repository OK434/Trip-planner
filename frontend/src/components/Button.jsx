export default function Button({ children, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={`bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg ${className}`}
        >
            {children}
        </button>
    );
}