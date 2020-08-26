const BusyStream = (timeout = 500) => {
    let count = 0;
    let stop = false;
    const cvs = document.createElement("canvas");

    const c = cvs.getContext("2d");
    const stream = cvs.captureStream(25);
    cvs.width = window.innerWidth / 2;
    cvs.height = window.innerHeight / 2;

    window.addEventListener("resize", function () {
        cvs.width = window.innerWidth / 2;
        cvs.height = window.innerHeight / 2;
    });
    let mouse = {
        x: undefined,
        y: undefined
    };
    class Line {
        constructor(x, y, offset) {
            this.x = x;
            this.y = y;
            this.offset = offset;
            this.radians = 0;
            this.velocity = 0.01;
        }

        draw = () => {
            // c.fillStyle = "green";
            // c.fillRect(20, 10, 150, 100);
            c.strokeStyle = "rgba(255, 255, 255, 0.5)";
            c.fillStyle = "rgba(255, 255, 255, 0.3)";

            const drawLinePath = (width = 0, color) => {
                c.beginPath();
                c.moveTo(this.x - width / 2, this.y + width / 2);
                c.lineTo(this.x - width / 2 + 300, this.y - width / 2 - 1000);
                c.lineTo(this.x + width / 2 + 300, this.y - width / 2 - 1000);
                c.lineTo(this.x + width / 2, this.y - width / 2);
                c.closePath();
                if (c.isPointInPath(mouse.x, mouse.y) && color) {
                    c.strokeStyle = color;
                }
            };

            drawLinePath(150, "#baf2ef");
            drawLinePath(50, "#dcf3ff");

            c.beginPath();
            c.arc(this.x, this.y, 1, 0, Math.PI * 2, false);
            c.fill();
            c.moveTo(this.x, this.y);
            c.lineTo(this.x + 300, this.y - 1000);
            c.stroke();
            c.closePath();

            this.update();
        };

        update = () => {
            this.radians += this.velocity;
            this.y = this.y + Math.cos(this.radians + this.offset);
        };
    }

    const lineArray = [];

    for (let i = 0; i < 100; i++) {
        const start = { x: -250, y: 800 };
        const random = Math.random() - 0.5;
        const unit = 25;

        lineArray.push(
            new Line(
                start.x + (unit + random) * i,
                start.y + (i + random) * -3 + Math.sin(i) * unit,
                0.1 + 1 * i
            )
        );
    }

    function animate() {
        count++;
        if (!stop && count < timeout) requestAnimationFrame(animate);
        c.clearRect(0, 0, window.innerWidth, window.innerHeight);
        lineArray.forEach((line) => {
            line.draw();
        });
    }

    animate();
    return {
        stream,
        toggle: () => {
            stop = !stop;
            if (!stop) animate();
        }
    };
};
export default BusyStream;
