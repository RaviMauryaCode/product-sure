import React from "react";

const ProductCanvas = ({ imageKey, entry, draw, height, width }) => {
	const canvas = React.useRef();

	React.useEffect(() => {
		console.log("drawing")
		const context = canvas.current.getContext("2d");
		draw(context, entry, height, width);
	}, [imageKey]);

	return (
		<canvas
			className="templateCanvas"
			ref={canvas}
			height={height}
			width={width}
		/>
	);
};

export default ProductCanvas;
