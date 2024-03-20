import { useState } from 'react';
import type P5 from 'p5';
import chroma, { Color } from 'chroma-js';
import P5Sketch from 'components/P5Sketch';
import PieceLayout from 'components/PieceLayout';
import SketchParams, { getInitialParamsValue } from 'components/SketchParams';
import { ParamTypes } from 'utils/Params';
import { Point, Bounds, Polygon } from '@mathigon/euclid';
import { now, random, range } from 'lodash';
import { Delaunay } from 'd3-delaunay';
import { keepNumberInside } from 'utils/number';

interface ISketchParams {
    points: number;
    padding: number;
    maxSpeed: number;
    pointSize: number;
}
const paramsConfig = [
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'points',
        min: 2,
        max: 100,
        step: 1,
        defaultValue: 19,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'padding',
        min: 0,
        max: 300,
        step: 1,
        defaultValue: 100,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'maxSpeed',
        min: 0,
        max: 10,
        step: 0.1,
        defaultValue: 1,
    },
    {
        type: ParamTypes.SINGLE_VALUE,
        name: 'pointSize',
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 0,
    },
];

export default function Voronoi() {
    const [params, setParams] = useState<ISketchParams>(
        getInitialParamsValue(paramsConfig) as ISketchParams,
    );

    return (
        <PieceLayout
            id={11}
            tools={
                <SketchParams<ISketchParams>
                    paramConfig={paramsConfig}
                    onChange={(newVal) => setParams(newVal)}
                />
            }
        >
            <P5Sketch sketchDefinition={getSketchDefinition(params)} />
        </PieceLayout>
    );
}

interface CustomPoint {
    position: Point;
    id: number;
    speed: Point;
    color: Color;
}

type PointWithPolygon = CustomPoint & {
    polygon: Polygon;
};

const getSketchDefinition = (params: ISketchParams) => {
    let points: CustomPoint[] = [];

    return (p5: P5) => {
        p5.disableFriendlyErrors = true;

        p5.setup = () => {
            p5.createCanvas(p5.windowWidth, p5.windowHeight);
            points = range(params.points).map((index) => ({
                position: Point.random(
                    new Bounds(
                        params.padding,
                        p5.windowWidth - params.padding,
                        params.padding,
                        p5.windowHeight - params.padding,
                    ),
                ),
                id: index,
                speed: new Point(
                    random(0, params.maxSpeed, true),
                    random(0, params.maxSpeed, true),
                ),
                color: getRandomColor(),
            }));
        };

        p5.windowResized = () => {
            p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
        };

        p5.draw = () => {
            p5.background('#fff');
            const bounds = new Bounds(0, p5.windowWidth, 0, p5.windowHeight);
            points = updatePoints(points, bounds);
            const voronoyPointsWithPolygons =
                getVoronoiPointsWithPolygonsPolygons(points, bounds);
            voronoyPointsWithPolygons.forEach((pointWithPolygon) => {
                p5.fill(pointWithPolygon.color.hex());
                p5.strokeWeight(10);
                p5.beginShape();
                pointWithPolygon.polygon.points.forEach((point) => {
                    p5.vertex(point.x, point.y);
                });
                p5.endShape(p5.CLOSE);

                p5.stroke('#000');
                p5.strokeWeight(params.pointSize);
                p5.point(
                    pointWithPolygon.position.x,
                    pointWithPolygon.position.y,
                );
            });
        };
    };

    function updatePoints(points: CustomPoint[], bounds: Bounds) {
        return points.map((point) => {
            const newX = keepNumberInside(
                point.position.x + point.speed.x,
                bounds.xMin,
                bounds.xMax,
            );
            const newY = keepNumberInside(
                point.position.y + point.speed.y,
                bounds.yMin,
                bounds.yMax,
            );
            return {
                ...point,
                position: new Point(newX, newY),
            };
        });
    }
};

function getVoronoiPointsWithPolygonsPolygons(
    points: CustomPoint[],
    viewport: Bounds,
): PointWithPolygon[] {
    const flatCoordinates = points.map(getDelaunayPoint);
    const d = Delaunay.from(flatCoordinates);
    const { xMin, xMax, yMin, yMax } = viewport;
    const voronoi = d.voronoi([xMin, yMin, xMax, yMax]);
    return points.map((point, index) => {
        return {
            ...point,
            polygon: getPolygonFromDelaunayPolygon(voronoi.cellPolygon(index)),
        };
    });
}

function getDelaunayPoint(customPoint: CustomPoint): Delaunay.Point {
    return [customPoint.position.x, customPoint.position.y];
}

function getPolygonFromDelaunayPolygon(polygon: Delaunay.Polygon): Polygon {
    const points = polygon.map(([x, y]) => new Point(x, y));
    return new Polygon(...points);
}

function getRandomColor() {
    // const h = random(0, 360);
    // const c = random(20, 70);
    // const l = 100 - c;
    // return chroma.hcl(h, c, l);
    const colors = chroma.scale([
        'f94144',
        'f3722c',
        'f8961e',
        'f9c74f',
        '90be6d',
        '43aa8b',
        '577590',
        '390099',
        '9e0059',
        'ff0054',
        'ff5400',
        'ffbd00',
    ]);
    return colors(Math.random());
}
