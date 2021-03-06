import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import {
  IContactCardProps,
  IContactCard,
  IAttributeValue,
  ContactCard
} from "./ContactCard";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class OfficeFabricCard
  implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _context: ComponentFramework.Context<IInputs>;
  private _props: IContactCardProps = {
    mainHeader: "",
    subHeader: "",
    bodyCaption: "",
    body: "",
    cardImage: "",
    cardData: [],
    totalResultCount: 0
  };

  private navigateToPage(pageCommand: string): void{
    switch(pageCommand){
      case 'next':
        if(this._context.parameters.sampleDataSet.paging.hasNextPage){
          this._context.parameters.sampleDataSet.paging.loadNextPage();
        }
        break;
        case 'previous':
            if(this._context.parameters.sampleDataSet.paging.hasPreviousPage){
              this._context.parameters.sampleDataSet.paging.loadPreviousPage();
            }
            break;        
    }
  }

  private navigateToRecord(id: string): void {
    let record = this._context.parameters.sampleDataSet.records[
      id
    ].getNamedReference();
    console.log(record);
    this._context.navigation.openForm({
      entityName: record.entityType!,
      entityId: record.id
    });
  }

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    // Add control initialization code
    this._container = container;
    this._context = context;
    this._props.triggerNavigate = this.navigateToRecord.bind(this);
    this._props.triggerPaging = this.navigateToPage.bind(this);
  }

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Add code to update control view
    if (context.parameters.sampleDataSet.loading) return;
    const dataSet = context.parameters.sampleDataSet;
    const dataSetColumns = dataSet.columns;

    this._props.body = context.parameters.body.raw;
    this._props.bodyCaption = context.parameters.bodyCaption.raw;
    this._props.mainHeader = context.parameters.mainHeader.raw;
    this._props.subHeader = context.parameters.subHeader.raw;
    this._props.cardImage = context.parameters.heroImage.raw;
    this._props.layout = context.parameters.layout.raw;
    this._props.totalResultCount = dataSet.paging.totalResultCount;

    const cardData: IContactCard[] = dataSet.sortedRecordIds.map(r => ({
      key: r,
      values: dataSetColumns.map(c => ({
        attribute: c.name,
        value: dataSet.records[r].getFormattedValue(c.name)
      }))
    }));
    this._props.cardData = cardData;

    ReactDOM.render(
      React.createElement(ContactCard, this._props),
      this._container
    );
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
    ReactDOM.unmountComponentAtNode(this._container);
  }
}
