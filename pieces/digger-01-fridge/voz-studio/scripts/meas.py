import sys, glob, os, numpy as np, soundfile as sf, pyloudnorm as pyln, parselmouth
def meas(fn, words=None):
    x, sr = sf.read(fn); x = x if x.ndim==1 else x.mean(1)
    lufs = pyln.Meter(sr).integrated_loudness(np.column_stack([x,x]) if True else x)
    p = parselmouth.Sound(x, sr).to_pitch_ac(pitch_floor=100, pitch_ceiling=600).selected_array['frequency']; p=p[p>0]
    f = parselmouth.Sound(x, sr).to_formant_burg(max_number_of_formants=5, maximum_formant=5500)
    pt = parselmouth.Sound(x, sr).to_pitch_ac(pitch_floor=100, pitch_ceiling=600)
    ts=[pt.get_time_from_frame_number(i+1) for i,v in enumerate(pt.selected_array['frequency']) if v>0]
    F=[np.nanmedian([f.get_value_at_time(k,t) for t in ts]) for k in (1,2,3)]
    # crest on 50ms rms of voiced parts
    fr = int(.05*sr); rms = np.sqrt(np.convolve(x**2, np.ones(fr)/fr, 'same')); act = rms > rms.max()*0.05
    crest = 20*np.log10(np.abs(x[act]).max()/np.sqrt(np.mean(x[act]**2)))
    hnr = parselmouth.praat.call(parselmouth.Sound(x,sr).to_harmonicity_cc(), "Get mean", 0, 0)
    dur = len(x)/sr
    return dict(f0=np.median(p), p5=np.percentile(p,5), p95=np.percentile(p,95), sd=np.std(12*np.log2(p/np.median(p))), F=F, lufs=lufs, crest=crest, hnr=hnr, dur=dur, wps=(words/dur if words else 0))
if __name__=="__main__":
    for fn in sys.argv[2:]:
        d = meas(fn, int(sys.argv[1]))
        print(f"{os.path.basename(fn):28s} F0 {d['f0']:4.0f} [{d['p5']:3.0f}-{d['p95']:3.0f}] sd {d['sd']:.1f}st  F1/2/3 {d['F'][0]:.0f}/{d['F'][1]:.0f}/{d['F'][2]:.0f}  LUFS {d['lufs']:6.1f}  crest {d['crest']:4.1f}  HNR {d['hnr']:4.1f}  dur {d['dur']:.1f}s  w/s {d['wps']:.2f}")
