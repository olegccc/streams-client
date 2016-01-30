interface IDataChannelListener {
    onChange(type: number, id: string) : Promise<void>;
}
