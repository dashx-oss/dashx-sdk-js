#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(DashX, RCTEventEmitter)
RCT_EXTERN_METHOD(setLogLevel:(NSInteger *)to)
RCT_EXTERN_METHOD(setup:(NSDictionary *)options)
RCT_EXTERN_METHOD(identify:(NSString *)uid options:(NSDictionary *)options)
RCT_EXTERN_METHOD(setIdentityToken:(NSString *)identityToken)
RCT_EXTERN_METHOD(reset)
RCT_EXTERN_METHOD(track:(NSString *)event data:(NSDictionary *)data)
RCT_EXTERN_METHOD(contentType:(NSString *)contentType options:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(content:(NSString *)urn resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(addContent:(NSString *)urn data:(NSDictionary *)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(editContent:(NSString *)urn data:(NSDictionary *)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
