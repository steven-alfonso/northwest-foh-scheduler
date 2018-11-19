export class Untitled1 {
    links:    Untitled1_Links;
    data:     PcoPlanDatum[];
    included: any[];
    meta:     Meta;
}

export class PcoPlanDatum {
    type:          Type;
    id:            string;
    attributes:    Attributes;
    relationships: Relationships;
    links:         DatumLinks;
}

export class Attributes {
    created_at:             Date;
    dates:                  string;
    files_expire_at:        Date;
    items_count:            number;
    last_time_at:           Date;
    multi_day:              boolean;
    needed_positions_count: number;
    other_time_count:       number;
    permissions:            Permissions;
    plan_notes_count:       number;
    plan_people_count:      number;
    public:                 boolean;
    rehearsal_time_count:   number;
    series_title:           null | string;
    service_time_count:     number;
    short_dates:            string;
    sort_date:              Date;
    title:                  null | string;
    total_length:           number;
    updated_at:             Date;
}

export enum Permissions {
    Administrator = "Administrator",
}

export class DatumLinks {
    self: string;
}

export class Relationships {
    service_type:     AttachmentTypes;
    next_plan:        CreatedBy;
    previous_plan:    CreatedBy;
    attachment_types: AttachmentTypes;
    series:           AttachmentTypes;
    created_by:       CreatedBy;
    updated_by:       AttachmentTypes;
}

export class AttachmentTypes {
    data: any[] | Parent | null;
}

export class Parent {
    type: Type;
    id:   string;
}

export enum Type {
    Person = "Person",
    Plan = "Plan",
    ServiceType = "ServiceType",
}

export class CreatedBy {
    data: Parent | null;
}

export class Untitled1_Links {
    self: string;
    prev: string;
}

export class Meta {
    total_count:  number;
    count:        number;
    prev:         Prev;
    can_order_by: string[];
    can_query_by: string[];
    can_include:  string[];
    can_filter:   string[];
    parent:       Parent;
}

export class Prev {
    offset: number;
}
