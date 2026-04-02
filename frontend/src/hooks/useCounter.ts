import { useState } from "react";




function useCounter (initialState: number) : [ number, () => void]
{
    const [counter, setCounter] = useState(initialState);

    function inc() {
        setCounter(counter + 1);
    }

    return [ 
        counter,
        inc
    ];
};

export default useCounter;
