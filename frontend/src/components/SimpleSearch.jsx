export default function SimpleSearch() {   
    return(
        <dialog>
            <form method="dialog">
                <input type="number" placeholder="Put your budget.." />
                <input type="boolean" placeholder="Include flights?" />
                 <input type="boolean" placeholder="More then one city?" />

            </form>
        </dialog>
    );
}