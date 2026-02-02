/**
 * Interface générique pour tous les cas d'utilisation (Driving Ports).
 * @template IRequest - Le type des données d'entrée (Command ou Query).
 * @template IResponse - Le type des données de sortie.
 */
export interface UseCase<IRequest, IResponse> {
    execute(request: IRequest): Promise<IResponse>;
}
