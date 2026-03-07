interface ToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

export default function Toggle({ enabled, onToggle }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E91E63] focus:ring-offset-2 ${enabled ? "bg-[#E91E63]" : "bg-gray-200"
                }`}
        >
            <span
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"
                    }`}
            />
        </button>
    );
}
