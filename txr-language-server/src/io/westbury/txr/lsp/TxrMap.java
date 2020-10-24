package io.westbury.txr.lsp;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Collectors;

public class TxrMap {

	public static final TxrMap INSTANCE = new TxrMap();
	
	final Properties props = new Properties();
	final Set<String> all;
	final Map<String, Collection<String>> isAfter;
	final Map<String, Collection<String>> isFollowedBy;
	final Map<String, String> type;
	
	private TxrMap() {
//		InputStream propertiesStream = TxrMap.class.getResourceAsStream("/" + TxrMap.class.getPackage().getName().replace(".", "/") + "/EclipseConSessions.properties");
//		try {
//			props.load(propertiesStream);
//			propertiesStream.close();
//		} catch (IOException e) {
//			e.printStackTrace();
//		}
		
		this.all = Arrays.stream(
				new String[] { "@(case)", "@(collect)", "@(end)" })
				.collect(Collectors.toSet());
		
		this.isAfter = new HashMap<>();
		this.all.stream().forEach(x -> isAfter.put(x,  new ArrayList<String>()));
		
		this.isFollowedBy = new HashMap<>();
		this.all.stream().forEach(x -> isFollowedBy.put(x,  new ArrayList<String>()));
		
		this.type = new HashMap<>();
		this.all.stream().forEach(x -> type.put(x,  "beginner"));
	}

	/**
	 * @return the list of routes that link from with to
	 */
	public List<String> findWaysBetween(String from, String to) {
		List<String> res = new ArrayList<String>();
		for (String way : all) {
			if (isAfter.get(way) != null && isAfter.get(way).contains(from) &&
					isFollowedBy.get(way) != null && isFollowedBy.get(way).contains(to)) {
				res.add(way);
			}
		}
		return res;
	}
	
	public boolean startsFrom(String route, String potentialStart) {
		return this.isAfter.get(route) != null && this.isAfter.get(route).contains(potentialStart);
	}
}
