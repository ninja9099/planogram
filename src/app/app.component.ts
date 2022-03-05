import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation
} from '@angular/core';
import {dia, layout, shapes, ui, util, V} from '@clientio/rappid';
import {
  getAllProducts, getAllShelves, Product, ProductElement, ShelfElement, storeItemsConfig
} from "./shapes";
import {validateChangePosition, validateChangeSize, isSizeValid, isPositionValid} from './validators';
import {addElementTools, removeElementTools} from "./tools";
import *  as  graphData from '../assets/example.json';

@Component({
  selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('stencilElement') stencilElement: ElementRef;
  @ViewChild('shelvesStencilElement') shelvesStencilElement: ElementRef;
  @Input() Products: Record<string, Product[]>;
  @Output() graphJson: EventEmitter<any> = new EventEmitter();
  @Output() toSVG: EventEmitter<any> = new EventEmitter();
  graph: dia.Graph;
  paper: dia.Paper;
  scroller: ui.PaperScroller;
  commandManager: dia.CommandManager;
  validator: dia.Validator;
  productsStencil: ui.Stencil;
  title = 'planogram';
  selectedCellView: dia.CellView | null;
  zoomScale = 50;
  productCatalouge = {
    products: {
        chips: [
            {
                product_id: 1,
                width: 189,
                height: 230,
                name: 'chips1',
                image: "https://assets-staging.nail-biter.com/client_356/product_25/images/35101.png"
            },
            {
                product_id: 2,
                width: 200,
                height: 310,
                name: 'chips2',
                image: "https://assets-staging.nail-biter.com/client_337/product_101/images/69219.png"
            },
            {
                product_id: 3,
                width: 200,
                height: 310,
                name: 'chips3',
                image: "https://assets-staging.nail-biter.com/client_337/product_105/images/19977.png"
            }
        ],
    }
}
  productCategories: Record<string, string> = {};
  constructor() {}

  ngOnInit() {
    var self = this;
    this.graph = new dia.Graph({}, {cellNamespace: shapes});
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
            sx: ctm.a || 1, sy: ctm.d || 1, ox: ctm.e || 0, oy: ctm.f || 0
          });

          // @ts-ignore
          options.width = gridSize * (ctm.a || 1) * (options.scaleFactor || 1);
          // @ts-ignore
          options.height = gridSize * (ctm.d || 1) * (options.scaleFactor || 1);

          if (!refs.exist(id)) {
            // @ts-ignore
            refs.add(id, V('pattern', {id: id, patternUnits: 'userSpaceOnUse'}, V(options.markup)));
          }

          var patternDefVel = refs.get(id);

          // @ts-ignore
          if (util.isFunction(options.update)) {
            // @ts-ignore
            options.update(patternDefVel.node.childNodes[0], options);
          }

          // @ts-ignore
          var x = options.ox % options.width;
          if (x < 0) { // @ts-ignore
            x += options.width;
          }

          // @ts-ignore
          var y = options.oy % options.height;
          if (y < 0) { // @ts-ignore
            y += options.height;
          }


          patternDefVel.attr({
            x: x, y: y, // @ts-ignore
            width: options.width, // @ts-ignore
            height: options.height
          });
        });

        var patternUri = new XMLSerializer().serializeToString(refs.root.node);
        patternUri = 'url(data:image/svg+xml;base64,' + btoa(patternUri) + ')';

        this.$grid.css('backgroundImage', patternUri);

        return this;
      },
    })
    this.paper = new PaperExtended({
      width: 800,
      height: 600,
      model: self.graph,
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
        return !(parentView.model instanceof ProductElement);

      },
      frontParentOnly: true,
      findParentBy: (elementView: { model: { getBBox: () => any; }; }) => {
        const area = elementView.model.getBBox();
        return self.graph.findModelsInArea(area).filter((model) => {
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
          name: 'stroke', options: {
            layer: 'front', padding: 0, attrs: {
              'stroke': '#0058FF', 'stroke-width': 3
            }
          }
        }
      }, // @ts-ignore
      interactive: ({model}) => {
        const isChildOfSelectedElement = this.selectedCellView ? model.isEmbeddedIn(this.selectedCellView.model) : false;
        return {
          stopDelegation: !isChildOfSelectedElement
        };
      }

    });
    var paper = this.paper
    this.scroller = new ui.PaperScroller({
      // @ts-ignore
      paper,
      autoResizePaper: true,
      cursor: 'grab',
      baseWidth: 400,
      baseHeight: 400,
      scrollWhileDragging: true,
      contentOptions: {
        allowNewOrigin: 'any', padding: 1, // maxWidth: 2500,
        // maxHeight: 2500
      }
    });
    const graph = self.graph;
    this.commandManager = new dia.CommandManager({
      graph
    });
    const commandManager = self.commandManager;
    this.validator = new dia.Validator({
      commandManager, cancelInvalid: true
    });
    this.buidlProductCategories(Object.keys(this.productCatalouge.products))
    this.productsStencil = new ui.Stencil({
      paper: this.scroller,
      width: 240,
      scaleClones: true,
      dropAnimation: true,
      usePaperGrid: true,
      theme: 'modern',
      groups: this.createStencilGroups(this.productCatalouge.products),
      paperOptions: () => {
        return {
          model: new dia.Graph({}, {cellNamespace: shapes}), sorting: dia.Paper.sorting.NONE, cellViewNamespace: shapes
        };
      },
      layout: (graph: dia.Graph, group: ui.Stencil.Group) => {
        return layout.GridLayout.layout(graph, {
          marginY: 20,
          marginX: 20,
          rowGap: 20,
          horizontalAlign: 'middle',
          verticalAlign: 'middle', ...group.layout as Object
        } as layout.GridLayout.Options);
      },

    });
  }

  setElement(cellView: dia.CellView) {
    this.selectedCellView = cellView;
    addElementTools(cellView);
  }

  unsetElement(paper: dia.Paper) {
    this.selectedCellView = null;
    removeElementTools(paper);
  }

  createStencilGroups(products: Record<string, Product[]>): Record<string, ui.Stencil.Group> {
      const groups = {};
      const layout = (columnsCount: number): layout.GridLayout.Options => {
        return {
          columns: columnsCount, columnWidth: 200 / columnsCount, rowHeight: 'compact'
        }
      };

      Object.keys(products).forEach((categoryName: string, idx: number) => {
        const maxWidth = products[categoryName].reduce((acc, product) => Math.max(acc, product.width), 0);
        // @ts-ignore
        groups[categoryName] = {
          layout: layout(5 - maxWidth), closed: idx > 3, index: idx + 1, // @ts-ignore
          label: this.productCategories[categoryName].toLowerCase()
        };
      });
      return groups;
    };

  buidlProductCategories(productCategories: string[]){
    for (let cat in productCategories) {
        let key = productCategories[cat]
        this.productCategories[key] = key.toUpperCase();
    }
}

  ngAfterViewInit(): void {
    this.canvas.nativeElement.appendChild(this.scroller.render().el);
    this.stencilElement.nativeElement.appendChild(this.productsStencil.el);
    this.productsStencil.render();
    const x = getAllProducts(this.productCatalouge.products);

    this.productsStencil.load(x)
    let data = (graphData as any).default
    this.graph.fromJSON(data);
    // Register Events
    this.validator.validate('change:position', validateChangePosition(this.graph));

    this.validator.validate('change:size', validateChangeSize(this.graph));

    this.validator.on('invalid', (err: { cell: dia.Cell, msg: string }): void => {
      const cellView = err.cell.findView(this.paper);
      if (cellView) {
        cellView.vel.removeClass('invalid');
      }
    });

    this.graph.on({
      'batch:stop': (batch: Record<string, any>): void => {
        const {cell, batchName} = batch;
        if (batchName !== 'resize') return;
        const cellView = cell.findView(this.paper);
        cellView.vel.toggleClass('invalid', !isSizeValid(this.graph, cell));
      }
    });

    this.paper.on({
      'blank:pointerdown': (evt: dia.Event): void => {
        this.unsetElement(this.paper);
        this.scroller.startPanning(evt);
      }, 'element:pointermove': (elementView: dia.ElementView, evt: dia.Event): void => {
        const {data} = evt;
        if (!data.moved) {
          data.currentCellView = elementView.getDelegatedView();
          data.moved = true;
          this.unsetElement(this.paper);
        }
        const delegatedView = data.currentCellView;
        delegatedView.vel.toggleClass('invalid', !isPositionValid(this.graph, delegatedView.model));
      }, 'element:pointerup': (elementView: dia.ElementView, evt: dia.Event): void => {
        if (evt.data.moved) {
          this.setElement(evt.data.currentCellView);
        } else {
          this.setElement(elementView);
        }
      }, 'element:pointerdblclick': (elementView: dia.ElementView): void => {
        const {model: element} = elementView;
        const parent = element.getParentCell();
        if (parent) {
          this.setElement(parent.findView(this.paper));
        }
      }
    });
    const stencilEventMap = (stencil: ui.Stencil) => {
      let self = this;
      return {
        'element:dragstart': function () {
          self.unsetElement(self.paper);
        },
        'element:drag': function (cloneView: dia.ElementView, evt: dia.Event, _dropArea: dia.BBox, validDropTarget: boolean) {
          if (validDropTarget) {
            cloneView.vel.toggleClass('invalid', !isPositionValid(self.graph, cloneView.model));
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
    this.productsStencil.on(stencilEventMap(this.productsStencil));
    this.zoomCanvas(this.zoomScale);
  }

  emitGraph() {
    return this.graph.toJSON();
  }

  emitSVG() {
    this.paper.toSVG((svg) => this.toSVG.emit(svg));
  }

  zoomCanvas(value: number) {
    this.scroller.zoom(value / 100, {absolute: true, grid: 20 / 100});
  }

  handleSliderZoom(event: any) {
    this.zoomScale = event.target.value;
    this.zoomCanvas(this.zoomScale);
  }

  handleMouseZoom(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      let wheelOffset = (event.deltaY / 25) * 4
      this.zoomScale += wheelOffset;
      // Restrict scale
      this.zoomScale = Math.min(Math.max(20, this.zoomScale), 500);
      this.zoomCanvas(this.zoomScale);
    }
  }

  adjustCanvasPaper() {
    this.scroller.adjustPaper().center();
  }

  addShelf(type: string) {
    let shelves_items = getAllShelves(storeItemsConfig.shelves)
    let cpy = shelves_items.filter(item => item.attributes['shelfType'] === type)[0].clone();
    cpy.addTo(this.graph);
  }

  undoRedo(action: "undo" | "redo") {
    if (action === 'undo') {
      this.commandManager.undo();
    } else {
      this.commandManager.redo();
    }
  }
}
