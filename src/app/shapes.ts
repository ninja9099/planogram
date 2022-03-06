import { dia, shapes, V } from '@clientio/rappid';

export interface Shelf {
    width: number;
    height: number;
    shelfType: ShelfTypes;
}

export interface Product {
    width: number;
    height: number;
    name: string;
    image: string;
    product_id: number;
}

export enum ShelfTypes {
    top = 'TOP',
    middle = 'MIDDLE',
    bottom = 'BOTTOM',
    full = 'FULL',
    priceTag = 'PRICETAG'
}

interface StoreItemsConfig {
    grid: number;
    shelves: Shelf[];
    // products: Record<string, Product[]>;
}


export const storeItemsConfig = {
    grid: 1,
    shelves: [
        {width: 914, height: 406, shelfType: ShelfTypes.top},
        {width: 914, height: 406, shelfType: ShelfTypes.middle},
        {width: 914, height: 406, shelfType: ShelfTypes.bottom},
        {width: 914, height: 80, shelfType: ShelfTypes.priceTag},
    ]
};


export const getAllProducts = (products: Record<string, Product[]>): Record<string, ProductElement[]> => {
    let prdcts: Record<string, ProductElement[]> = {};
    Object.keys(products).forEach((category) => {
        const productCategory = products[category];
        productCategory.forEach((product) => {
            const productShape = ProductElement.create(product);
            prdcts[category] = prdcts[category] || [];
            prdcts[category].push(productShape);
        });
    });
    return prdcts;
};

export const getAllShelves = (shelves: Shelf[]): ShelfElement[] => {
    return Object.values(shelves).map(shelf => {
        switch (shelf.shelfType) {
            case ShelfTypes.full:
                return ShelfElement.create(shelf)
                    .translate(20, 50)
                    .attr(['top', 'display'], 'block')
                    .attr(['bottom', 'display'], 'block');
            case ShelfTypes.top:
                return ShelfElement.create(shelf)
                    .attr(['top', 'display'], 'block')
                    .translate(20, 280);
            case ShelfTypes.bottom:
                return ShelfElement.create(shelf)
                    .attr(['bottom', 'display'], 'block')
                    .translate(20, 660);
            default:
            case ShelfTypes.middle:
                return ShelfElement.create(shelf)
                    .translate(20, 470);
        }
    });
}

const calcSize = (size: dia.Size): dia.Size => {
    return {
        width: size.width * 1,
        height: size.height * 1
    };
};

const bg = '#DBDFEE';
const fg = '#CACCD4';

export class ShelfElement extends dia.Element {
  override markup = [{
        tagName: 'g',
        selector: 'top',
        children: [{
            tagName: 'rect',
            selector: 'topBackground'
        }, {
            tagName: 'rect',
            selector: 'topForeground'
        }]
    }, {
        tagName: 'rect',
        selector: 'bottom'
    }, {
        tagName: 'rect',
        selector: 'middle'
    }];

  override defaults() {
        return {
            ...super.defaults,
            type: 'app.Shelf',
            attrs: {
                root: {
                    containerSelector: 'middle'
                },
                top: {
                    display: 'none',
                    refY: -30
                },
                topForeground: {
                    refWidth: '100%',
                    refWidth2: -2,
                    y: 1,
                    x: 1,
                    height: 25,
                    rx: 4,
                    ry: 4,
                    fillPattern: 'assets/shelf/marquee.svg',
                },
                topBackground: {
                    refWidth: '100%',
                    height: 35,
                    rx: 4,
                    ry: 4,
                    fill: bg,
                    stroke: fg,
                    strokeWidth: 2
                },
                middle: {
                    refHeight: '100%',
                    refWidth: '100%',
                    stroke: fg,
                    fill: '#F5F6FA',
                    strokeWidth: 2,
                },
                bottom: {
                    display: 'none',
                    refWidth: '100%',
                    refY: '100%',
                    y: -5,
                    height: 20,
                    rx: 4,
                    ry: 4,
                    fill: bg,
                    strokeWidth: 2,
                    stroke: fg
                }
            }
        }
    }

    static attributes = {
        fillPattern: {
            set: function(image: string): { fill: string } {
                const { paper } = this as any;
                const MARGIN = 0;
                const width = 60;
                const height = 26;
                const patternId = image + paper.cid;
                if (!paper.isDefined(patternId)) {
                    V('pattern', {
                        'id': patternId,
                        'width': width,
                        'height': height,
                        'patternUnits': 'userSpaceOnUse'
                    }, [
                        V('rect', {
                            'y': 4,
                            'width': width,
                            'height': height - 8,
                            'fill': '#AFB6D6'
                        }),
                        V('image', {
                            'xlink:href': image,
                            'preserveAspectRatio': 'none',
                            'x': MARGIN / 2,
                            'y': MARGIN / 2,
                            'width': width - MARGIN,
                            'height': height - MARGIN
                        })
                    ]).appendTo(paper.defs);
                }
                return {
                    'fill': `url(#${patternId})`
                };
            }
        }
    }

    static create(shelf: Shelf): ShelfElement {
        const { shelfType } = shelf;
        return new this({
            shelfType,
            size: calcSize(shelf)
        });
    }
}

export class ProductElement extends dia.Element {

  override markup = [{
        tagName: 'rect',
        selector: 'body'
    }]

  override defaults() {
        return {
            ...super.defaults,
            type: 'app.Product',
            attrs: {
                body: {
                    refWidth: '100%',
                    refHeight: '100%',
                    strokeWidth: 2,
                    stroke: 'none'
                }
            }
        }
    }

    public match(group: string, keyword: string) {
        if (this.get('productType').includes(keyword.toLowerCase())) return true;
        // @ts-ignore
        if (ProductCategories[group].includes(keyword.toUpperCase())) return true;
        return false;
    }

    static attributes = {
        productImage: {
            set: function (image: string): { fill: string } {
                const { paper, model } = this as any;
                const MARGIN = 8;
                const { width, height } = calcSize(model.get('productSize'));
                const patternId = image + paper.cid;
                if (!paper.isDefined(patternId)) {
                    V('pattern', {
                        'id': patternId,
                        'width': width,
                        'height': height,
                        'patternUnits': 'userSpaceOnUse'
                    }, [
                        /* Optional background for images
                        V('rect', {
                            'x': 2,
                            'y': 2,
                            'width': width - 4,
                            'height': height - 4,
                            'fill': '#FFFFFF'
                        }),
                        */
                        V('image', {
                            'xlink:href': image,
                            'preserveAspectRatio': 'none',
                            'x': MARGIN / 2,
                            'y': MARGIN / 2,
                            'width': width - MARGIN,
                            'height': height - MARGIN
                        })
                    ]).appendTo(paper.defs);
                }
                return {
                    'fill': `url(#${patternId})`
                };
            }
        }
    }

    static create(product: Product): ProductElement {
         let {name, width, height, image, product_id} = product;
        let aspectRatio = product.width/product.height;
        // let stencilProductSize = { width: 90 * aspectRatio , height: 90};
        let scale = 3;
        if(width < 120 || height < 120){
            scale = 1.5;
        }
        let stencilProductSize = { width: Math.floor(width/scale) , height: Math.floor(height/scale)};

        return new this({
            productType: name,
            originalSize : {width, height},
            productSize: stencilProductSize,
            paperSize:  {width, height},
            productId: product_id,
            size: calcSize(stencilProductSize),
            attrs: {
                body: {
                    productImage: image
                }
            }
        });
    }
}

Object.assign(shapes, {
    app: {
        Shelf: ShelfElement,
        Product: ProductElement
    }
});
