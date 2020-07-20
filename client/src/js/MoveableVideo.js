import Moveable from "react-moveable";
import React from "react";


const MoveableVideo = ({ target }) => {
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
                    // throttleDrag={ 0 }
                    origin={ false }
                    onDrag={ handleDrag }
                /> : null }
            <div
                ref={ moveRef }
                style={ {
                    transform: style
                } }
            >
                { target }
                {/* Move me */ }
            </div>
            {/* <MovableComponent moveRef={moveRef} setStyle={setStyle} /> */ }
        </div>
    );
};

export default MoveableVideo;