/* eslint-disable max-classes-per-file */
export class WelcomeMessageDto {
    id!: string;

    type!: 'welcome';
}

export function isWelcomeMessageDto(message: unknown): message is WelcomeMessageDto {
    return JSON.parse((String(message))).type === 'welcome';
}

export class AckMessageDto {
    id!: string;

    type!: 'ack';
}

export function isAckMessageDto(message: unknown, id: string): message is AckMessageDto {
    const parsedMessage = JSON.parse((String(message))) as AckMessageDto;

    return parsedMessage.type === 'ack' && parsedMessage.id === id;
}
