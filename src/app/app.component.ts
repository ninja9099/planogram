import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {dia, layout, shapes, ui, util, V} from '@clientio/rappid';
import {ProductCategories, ProductElement, ShelfElement, storeItemsConfig} from "./shapes";
import { validateChangePosition, validateChangeSize, isSizeValid, isPositionValid } from './validators';
import {addElementTools, removeElementTools} from "./tools";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;
  private graph: dia.Graph;
  private paper: dia.Paper;
  private scroller: ui.PaperScroller;
  title = 'planogram';
  selectedCellView: dia.CellView | null;

  constructor() {
  }

  ngOnInit() {
    const graph = this.graph = new dia.Graph({}, {cellNamespace: shapes});
    const PaperExtended = dia.Paper.extend({
      drawGrid: function (opt: any) {

        var gridSize = this.options.gridSize;
        gridSize = 76;
        if (gridSize <= 1) {
          return this.clearGrid();
        }

        var localOptions = Array.isArray(opt) ? opt : [opt];

        var ctm = this.matrix();
        var refs = this._getGridRefs();

        this._gridSettings.forEach(function (gridLayerSetting: any, index: string) {

          var id = 'pattern_' + index;
          // @ts-ignore
          var options = util.merge(gridLayerSetting, localOptions[index], {
            sx: ctm.a || 1,
            sy: ctm.d || 1,
            ox: ctm.e || 0,
            oy: ctm.f || 0
          });

          // @ts-ignore
          options.width = gridSize * (ctm.a || 1) * (options.scaleFactor || 1);
          // @ts-ignore
          options.height = gridSize * (ctm.d || 1) * (options.scaleFactor || 1);

          if (!refs.exist(id)) {
            refs.add(id, V('pattern', {id: id, patternUnits: 'userSpaceOnUse'}, V(options.markup)));
          }

          var patternDefVel = refs.get(id);

          if (util.isFunction(options.update)) {
            options.update(patternDefVel.node.childNodes[0], options);
          }

          var x = options.ox % options.width;
          if (x < 0) x += options.width;

          var y = options.oy % options.height;
          if (y < 0) y += options.height;

          patternDefVel.attr({
            x: x,
            y: y,
            width: options.width,
            height: options.height
          });
        });

        var patternUri = new XMLSerializer().serializeToString(refs.root.node);
        patternUri = 'url(data:image/svg+xml;base64,' + btoa(patternUri) + ')';

        this.$grid.css('backgroundImage', patternUri);

        return this;
      },
    })
    const paper = new PaperExtended({
      width: 800,
      height: 600,
      model: graph,
      gridSize: 1,
      drawGrid: {name: 'mesh', color: '#d4d4d4'},
      background: {color: '#FBFBFB'},
      embeddingMode: true,
      moveThreshold: 1,
      clickThreshold: 1,
      validateEmbedding: function (childView: { model: any; }, parentView: { model: any; }) {
        if (childView.model instanceof ShelfElement) {
          return false;
        }
        if (parentView.model instanceof ProductElement) {
          return false;
        }
        return true;
      },
      frontParentOnly: true,
      findParentBy: (elementView: { model: { getBBox: () => any; }; }) => {
        const area = elementView.model.getBBox();
        return graph.findModelsInArea(area).filter((model) => {
          if (model instanceof ProductElement) {
            return true;
          }
          return model.getBBox().containsRect(area);
        });
      },
      async: true,
      sorting: dia.Paper.sorting.APPROX,
      cellViewNamespace: shapes,
      highlighting: {
        embedding: {
          name: 'stroke',
          options: {
            layer: 'front',
            padding: 0,
            attrs: {
              'stroke': '#0058FF',
              'stroke-width': 3
            }
          }
        }
      },
      interactive: ({model}) => {
        const isChildOfSelectedElement = this.selectedCellView
          ? model.isEmbeddedIn(this.selectedCellView.model)
          : false;
        return {
          stopDelegation: !isChildOfSelectedElement
        };
      }
    });

    const scroller = this.scroller = new ui.PaperScroller({
      paper,
      autoResizePaper: true,
      cursor: 'grab'
    });
    const commandManager = new dia.CommandManager({
      graph
    });
    const validator = new dia.Validator({
      commandManager,
      cancelInvalid: true
    });

    const createStencilGroups = (): Record<string, ui.Stencil.Group> => {

      const {products} = storeItemsConfig;
      const groups = {};
      const layout = (columnsCount: number): layout.GridLayout.Options => {
        return {
          columns: columnsCount,
          columnWidth: 200 / columnsCount,
          rowHeight: 'compact'
        }
      };

      Object.keys(products).forEach((categoryName: string, idx: number) => {
        const maxWidth = products[categoryName].reduce(
          (acc, product) => Math.max(acc, product.width),
          0
        );
        groups[categoryName] = {
          layout: layout(5 - maxWidth),
          closed: idx > 3,
          index: idx + 1,
          label: ProductCategories[categoryName].toLowerCase()
        };
      });

      return groups;
    };

    const productsStencil = new ui.Stencil({
      paper: scroller,
      width: 240,
      scaleClones: true,
      dropAnimation: true,
      usePaperGrid: true,
      theme: 'modern',
      groups: createStencilGroups(),
      paperOptions: () => {
        return {
          model: new dia.Graph({}, {cellNamespace: shapes}),
          sorting: dia.Paper.sorting.NONE,
          cellViewNamespace: shapes
        };
      },
      layout: (graph: dia.Graph, group: ui.Stencil.Group) => {
        return layout.GridLayout.layout(graph, {
          marginY: 20,
          marginX: 20,
          rowGap: 20,
          horizontalAlign: 'middle',
          verticalAlign: 'middle',
          ...group.layout as Object
        } as layout.GridLayout.Options);
      },
      search: (product: ProductElement, keyword: string, group: string): boolean => {
        return product.match(group, keyword);
      }
    });

    stencilElement.appendChild(productsStencil.el);
    productsStencil.render();
    productsStencil.load(getAllProducts())

    const shelvesStencil = new ui.Stencil({
      paper: scroller,
      width: 340,
      height: 850,
      scaleClones: true,
      dropAnimation: true,
      usePaperGrid: true,
      theme: 'modern',
      layout: false,
      paperOptions: () => {
        return {
          model: new dia.Graph({}, {cellNamespace: shapes}),
          sorting: dia.Paper.sorting.NONE,
          cellViewNamespace: shapes
        };
      }
    });

    shelvesStencilElement.appendChild(shelvesStencil.el);
    shelvesStencil.render();
    shelvesStencil.load(getAllShelves());

    graph.fromJSON(exampleGraph);

    // Register Events

    validator.validate('change:position', validateChangePosition(graph));

    validator.validate('change:size', validateChangeSize(graph));

    validator.on('invalid', (err: { cell: dia.Cell, msg: string }): void => {
      const cellView = err.cell.findView(paper);
      if (cellView) {
        cellView.vel.removeClass('invalid');
      }
    });

    graph.on({
      'batch:stop': (batch: Record<string, any>): void => {
        const {cell, batchName} = batch;
        if (batchName !== 'resize') return;
        const cellView = cell.findView(paper);
        cellView.vel.toggleClass('invalid', !isSizeValid(graph, cell));
      }
    });

    paper.on({
      'blank:pointerdown': (evt: dia.Event): void => {
        this.unsetElement(paper);
        scroller.startPanning(evt);
      },
      'element:pointermove': (elementView: dia.ElementView, evt: dia.Event): void => {
        const {data} = evt;
        if (!data.moved) {
          data.currentCellView = elementView.getDelegatedView();
          data.moved = true;
          this.unsetElement(paper);
        }
        const delegatedView = data.currentCellView;
        delegatedView.vel.toggleClass('invalid', !isPositionValid(graph, delegatedView.model));
      },
      'element:pointerup': (elementView: dia.ElementView, evt: dia.Event): void => {
        if (evt.data.moved) {
          this.setElement(evt.data.currentCellView);
        } else {
          this.setElement(elementView);
        }
      },
      'element:pointerdblclick': (elementView: dia.ElementView): void => {
        const {model: element} = elementView;
        const parent = element.getParentCell();
        if (parent) {
          this.setElement(parent.findView(paper));
        }
      }
    });

    const stencilEventMap = (stencil: ui.Stencil) => {
      let self = this;
      return {
        'element:dragstart': function () {
          self.unsetElement(paper);
        },
        'element:drag': function (cloneView: dia.ElementView, evt: dia.Event, _dropArea: dia.BBox, validDropTarget: boolean) {
          if (validDropTarget) {
            cloneView.vel.toggleClass('invalid', !isPositionValid(graph, cloneView.model));
            cloneView.vel.removeAttr('opacity');
          } else {
            cloneView.vel.removeClass('invalid');
            cloneView.vel.attr('opacity', 0.5);
          }
        },
        'element:dragend': function (cloneView: dia.ElementView, evt: dia.Event) {
          if (cloneView.vel.hasClass('invalid')) {
            stencil.cancelDrag({dropAnimation: true});
          }
        },
        'element:drop': function (elementView: dia.ElementView) {
          self.setElement(elementView);
        }
      };
    };

    productsStencil.on(stencilEventMap(productsStencil));
    shelvesStencil.on(stencilEventMap(shelvesStencil));
  }

  setElement(cellView: dia.CellView) {
    this.selectedCellView = cellView;
    addElementTools(cellView);
  }

  unsetElement(paper: dia.Paper) {
    this.selectedCellView = null;
    removeElementTools(paper);
  }


  public ngAfterViewInit(): void {
    const {scroller, paper, canvas} = this;
    canvas.nativeElement.appendChild(this.scroller.el);
    scroller.center();
    paper.unfreeze();
  }
}
