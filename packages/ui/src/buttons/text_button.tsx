
const TextButton = (
    {theme='primary', text, isForm=false, onClick, className } : {theme?:string, text:string, isForm?:boolean, onClick?: ()=>void, className?:string}
) => {
    const themeStyle = theme=='secondary'?"border-navy-blue text-navy-blue bg-white":"border-white text-white bg-navy-blue";
    return <button
        type={isForm?"submit":"button"} 
        onClick = {onClick??undefined}
        className={`text-xs lg:text-base px-2 lg:px-5 py-1 lg:py-2 border-2 rounded-lg hover:opacity-80 font-semibold ${themeStyle} ${className??""}`}
    >
        {text}
    </button>
}

export default TextButton;