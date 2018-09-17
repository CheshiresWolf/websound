import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

const colors = {
	primary: "#1867C0",
	secondary: "#5CBBF6",
	tertiary: "#E57373",
	accent: "#005CAF",
	gray: "#ccc",
	white: "#fff",
	black: "#000",
	yellow: "#f4d742",
	red: "#d63535",
	purple: "#673AB7"
};

// pre defined color scheme for node types and the corresponding forms
const diagramColors = {
	fact: "#4CAF50",
	Fact: "#4CAF50",
	sensor: "#D32F2F",
	Sensor: "#D32F2F",
	association: "#FFEB3B",
	Association: "#FFEB3B",
	response: "#82B1FF",
	Response: "#82B1FF",
	knowledge: "#80DEEA",
	Knowledge: "#80DEEA",
	researcher: "#EA80FC",
	Researcher: "#EA80FC",
	abstraction: "#f4b342",
	Abstraction: "#f4b342",
	solver: "#BDBDBD",
	Solver: "#BDBDBD"
};

const allColors = Object.assign(colors, diagramColors);

Vue.use(Vuetify, {
	iconfont: "md" || "mdi" || "fa" || "fa4",
	theme: allColors
});

export default allColors;
