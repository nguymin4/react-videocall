import Moveable from "react-moveable";
import React from "react";


const ThingToMove = () => {
    const [renderMovable, settRenderMovable] = React.useState(false);

    React.useEffect(() => {
        settRenderMovable(true);
    }, []);
    const moveRef = React.useRef(null);
    const [style, setStyle] = React.useState("");
    const handleDrag = e => {
        setStyle(e.transform);
    };

    return (
        <div>
            { renderMovable ?
                <Moveable
                    target={ moveRef && moveRef.current }
                    draggable={ true }
                    throttleDrag={ 0 }
                    onDrag={ handleDrag }
                /> : "FOO" }
            <h2
                ref={ moveRef }
                style={ {
                    transform: style
                } }
            >
                Move me
      </h2>
            {/* <MovableComponent moveRef={moveRef} setStyle={setStyle} /> */ }
        </div>
    );
};

export default ThingToMove;