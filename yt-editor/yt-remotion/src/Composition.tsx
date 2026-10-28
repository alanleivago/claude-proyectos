import { CalculateMetadataFunction, Composition } from "remotion";
import { Titles, TitlesProps } from "./Titles";

const calculateMetadata: CalculateMetadataFunction<TitlesProps> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.ceil(Math.max(0, ...props.titles.map((t) => t.end)) * 30)),
});

export const MyComposition = () => {
  return (
    <Composition
      id="Titles"
      component={Titles}
      durationInFrames={60}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ titles: [{ start: 0, end: 3, l1: "Imagina que vas caminando", l2: "*a tu trabajo*" }] }}
      calculateMetadata={calculateMetadata}
    />
  );
};
