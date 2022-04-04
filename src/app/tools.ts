import { dia, elementTools, ui } from '@clientio/rappid';
import {ProductElement, ShelfTypes, storeItemsConfig} from './shapes';

export function addElementTools(cellView: dia.CellView): void {

    const { paper, model: cell } = cellView;

    // @ts-ignore
  removeElementTools(paper);

    let padding;
    let offset;
    let resizeGrid;

    if (cell instanceof ProductElement) {
       const { width, height } = cell.get('productSize');
        padding = 0;
        offset = { x: 14, y: -14 };
        resizeGrid = {
            width: width * storeItemsConfig.grid,
            height: height * storeItemsConfig.grid
        };
    } else {
        switch (cell.get('shelfType')) {
            case ShelfTypes.full: {
                padding =  { left: 7, top: 20, right: 7, bottom: 22 };
                offset = { x: 20, y: -50 };
                break;
            }
            case ShelfTypes.top: {
                padding =  { left: 7, top: 20, right: 7, bottom: 7 };
                offset = { x: 20, y: -50 };
                break;
            }
            case ShelfTypes.bottom: {
                padding = { left: 7, top: 7, right: 7, bottom: 22 };
                offset = { x: 20, y: -20 };
                break;
            }
            default: {
                padding = 7;
                offset = { x: 20, y: -20 };
                break;
            }
        }
    }


  const freeTransform = new ui.FreeTransform({
        cellView,
        // @ts-ignore
        resizeGrid,
        allowRotation: false,
        padding,
        theme: 'modern'
    });

    const toolsView = new dia.ToolsView({
        tools: [
            new elementTools.Remove({
                x: '100%',
                offset,
                useModelGeometry: true,
                markup: [{
                    tagName: 'circle',
                    selector: 'button',
                    attributes: {
                        'r': 10,
                        'fill': '#0058FF',
                        'cursor': 'pointer'
                    }
                }, {
                    tagName: 'path',
                    selector: 'icon',
                    attributes: {
                        'd': 'M -4 -4 4 4 M -4 4 4 -4',
                        'fill': 'none',
                        'stroke': '#FFFFFF',
                        'stroke-width': 2,
                        'pointer-events': 'none'
                    }
                }]
            })
        ]
    });

    freeTransform.render();
    cellView.addTools(toolsView);
}

export function removeElementTools(paper: dia.Paper): void {
    paper.removeTools();
    ui.FreeTransform.clear(paper);
}
